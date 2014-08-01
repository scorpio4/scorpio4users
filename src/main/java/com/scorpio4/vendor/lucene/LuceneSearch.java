package com.scorpio4.vendor.lucene;
/*
 *   Fact:Core - CONFIDENTIAL
 *   Unpublished Copyright (c) 2009-2014 Lee Curtis, All Rights Reserved.
 *
 *   NOTICE:  All information contained herein is, and remains the property of Lee Curtis. The intellectual and technical concepts contained
 *   herein are proprietary to Lee Curtis and may be covered by Australian, U.S. and Foreign Patents, patents in process, and are protected by trade secret or copyright law.
 *   Dissemination of this information or reproduction of this material is strictly forbidden unless prior written permission is obtained
 *   from Lee Curtis.  Access to the source code contained herein is hereby forbidden to anyone except current Lee Curtis employees, managers or contractors who have executed
 *   Confidentiality and Non-disclosure agreements explicitly covering such access.
 *
 *   The copyright notice above does not evidence any actual or intended publication or disclosure  of  this source code, which includes
 *   information that is confidential and/or proprietary, and is a trade secret, of Lee Curtis.   ANY REPRODUCTION, MODIFICATION, DISTRIBUTION, PUBLIC  PERFORMANCE,
 *   OR PUBLIC DISPLAY OF OR THROUGH USE  OF THIS  SOURCE CODE  WITHOUT  THE EXPRESS WRITTEN CONSENT OF LEE CURTIS IS STRICTLY PROHIBITED, AND IN VIOLATION OF APPLICABLE
 *   LAWS AND INTERNATIONAL TREATIES.  THE RECEIPT OR POSSESSION OF  THIS SOURCE CODE AND/OR RELATED INFORMATION DOES NOT CONVEY OR IMPLY ANY RIGHTS
 *   TO REPRODUCE, DISCLOSE OR DISTRIBUTE ITS CONTENTS, OR TO MANUFACTURE, USE, OR SELL ANYTHING THAT IT  MAY DESCRIBE, IN WHOLE OR IN PART.
 *
 */

import com.scorpio4.util.Identifiable;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.index.IndexableField;
import org.apache.lucene.queries.mlt.MoreLikeThis;
import org.apache.lucene.queryparser.classic.MultiFieldQueryParser;
import org.apache.lucene.queryparser.classic.ParseException;
import org.apache.lucene.search.*;
import org.apache.lucene.search.similarities.TFIDFSimilarity;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;
import org.apache.lucene.util.Version;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.util.*;

/**
 * Fact:Core (c) 2006-2013
 * User: lee
 *
 * Find documents in directory
 *
 */
public class LuceneSearch implements Identifiable {
    private static final Logger log = LoggerFactory.getLogger(LuceneSearch.class);
    String identity = null;

	Directory directory;
	IndexReader indexReader;
	StandardAnalyzer analyzer;
	IndexSearcher searcher;
	int hitsPerPage = 50;
    List<String> fields = new ArrayList();

	public LuceneSearch() {
	}

    public LuceneSearch(File dir) throws IOException {
        open(FSDirectory.open(dir));
    }

    public LuceneSearch(Directory directory) throws IOException {
		open(directory);
	}

    public boolean isRunning() {
        return searcher!=null;
    }

    public void open(File dir) throws IOException {
        open(FSDirectory.open(dir));
    }

	public void open(Directory index) throws IOException {
		this.analyzer = new StandardAnalyzer(Version.LUCENE_43);
		this.indexReader =  DirectoryReader.open(index);
		this.searcher = new IndexSearcher(indexReader);
        searchField("label");
        searchField("comment");
	}

	public void stop() {
        try {
            this.indexReader.close();
            this.searcher = null;
            this.indexReader = null;
        } catch (IOException e) {
            log.error("urn:factcore:fact:finder:lucene:oops:close-failed#"+e.getMessage(),e);
        }
    }

    public void searchField(String field) {
        fields.add(field);
    }

	public Collection<Map<String,Object>> search(String query, Map meta) {
		try {
            Query q = getQuery(query);
			return search(q);
		} catch (ParseException e) {
			e.printStackTrace();
			return null;
		}
	}

    private Query getQuery(String query) throws ParseException {
        String[] fieldArray = fields.toArray(new String[fields.size()]);
        return new MultiFieldQueryParser(Version.LUCENE_43, fieldArray, analyzer).parse(query);
    }

    public Collection<Map<String,Object>> search(Query q) {
		try {
			TopScoreDocCollector collector = TopScoreDocCollector.create(this.hitsPerPage, true);
			searcher.search(q, collector);
			return toModels(collector.topDocs());
		} catch (IOException e) {
			e.printStackTrace();
			return null;
		}
	}

	protected Collection<Map<String,Object>> toModels(TopDocs topDocs) throws IOException {
		ScoreDoc[] hits = topDocs.scoreDocs;
		List<Map<String,Object>> models = new ArrayList();
		for(int i=0;i<hits.length;++i) {
			int docId = hits[i].doc;
			Document doc = searcher.doc(docId);
			Map<String, Object> model = new HashMap();
			model.put("_", new Integer(docId));
			List<IndexableField> fields = doc.getFields();
			for(int fi=0;fi<fields.size();fi++) {
				IndexableField field = fields.get(fi);
				model.put(field.name(),field.stringValue());
			}
			models.add(model);
		}
		return models;
	}
/*
    public Collection<Map<String,Object>> similar(String q) {
        try {
            TopScoreDocCollector collector = TopScoreDocCollector.create(this.hitsPerPage, true);
            Query query = getQuery(q);
            searcher.search(query, collector);
            TopDocs topDocs = collector.topDocs();

            similar();
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }
*/
	public Query similar(int docNum) throws IOException {
		MoreLikeThis mlt = new MoreLikeThis(this.indexReader);
        mlt.setAnalyzer(this.analyzer);
        String[] fieldArray = fields.toArray(new String[fields.size()]);
        mlt.setFieldNames(fieldArray);
        mlt.setMinWordLen(2);
        mlt.setBoost(true);
        TFIDFSimilarity similar = mlt.getSimilarity();
        Query q = mlt.like(docNum);
        log.debug("Similar: "+docNum+" -> "+mlt+" -> similar: "+similar+", query: "+q);
		return q;
	}

    @Override
    public String getIdentity() {
        return identity;
    }

}
