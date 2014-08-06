package com.scorpio4.vendor.lucene;
/*
 *   Scorpio4 - CONFIDENTIAL
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
import com.scorpio4.oops.IQException;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field;
import org.apache.lucene.document.StringField;
import org.apache.lucene.document.TextField;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.index.Term;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;
import org.apache.lucene.util.Version;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.util.Iterator;
import java.util.Map;

/**
 * Scorpio4 (c) 2006-2013
 * User: lee
 *
 * Generate a lucene directory
 *
 */
public class LuceneIndexer {
    private static final Logger log = LoggerFactory.getLogger(LuceneIndexer.class);

	IndexWriter indexWriter = null;
	Directory directory = null;
	boolean autoCommit = true;

    public LuceneIndexer() throws IOException {
    }

	public LuceneIndexer(File file) throws IOException, IQException {
        open(FSDirectory.open(file));
    }

	public LuceneIndexer(Directory directory) throws IOException, IQException {
		open(directory);
	}

	public Directory getDirectory() {
		return this.directory;
	}

	public void open() throws IOException, IQException {
		open(this.directory);
	}

	public void open(Directory directory) throws IOException, IQException {
		if (this.directory!=null) throw new IOException("Directory already assigned");
		StandardAnalyzer analyzer = new StandardAnalyzer(Version.LUCENE_45);
		IndexWriterConfig config = new IndexWriterConfig(Version.LUCENE_45, analyzer);
		this.indexWriter = new IndexWriter(directory, config);
		if (autoCommit) begin();
	}

	public void close() throws IOException, IQException {
		if (autoCommit) commit();
		this.indexWriter.close();
	}

	public void learn(String doc_uri, Map<String, Object> meta) throws IQException {
		try {
			learnDocument(doc_uri,meta);
			if (autoCommit) commit();
		} catch (IOException e) {
			throw new IQException(e.getMessage());
		}
	}

	protected void learnDocument(String doc_uri, Map<String, Object> meta) throws IOException, IQException {
        forget(doc_uri, meta);
		Document doc = new Document();
		doc.add(new StringField("this", doc_uri, Field.Store.YES));
		Iterator it = meta.entrySet().iterator();
        Object v = null;
		while (it.hasNext()) {
			Map.Entry kv = (Map.Entry)it.next();
            v = kv.getValue();
            if (v!=null) {
                TextField textField = new TextField(kv.getKey().toString(), v.toString(), Field.Store.YES);
                doc.add(textField);
//                log.debug("learn: " + doc_uri + " --> " + textField);
            }
		}
		this.indexWriter.addDocument(doc);
	}

	public int update(String query, Map<String, Object> meta) throws IQException {
        learn(query,meta);
		return 1;
	}

	public void forget(String doc_uri, Map<String, Object> meta) throws IQException {
        try {
            this.indexWriter.deleteDocuments( new Term("this", doc_uri ));
        } catch (IOException e) {
            throw new IQException("Delete failed:"+e.getMessage(),e);
        }
	}

	public void begin() throws IQException {
		try {
			this.indexWriter.prepareCommit();
		} catch (IOException e) {
			throw new IQException(e.getMessage());
		}
	}

	public void commit() throws IQException {
		try {
			this.indexWriter.commit();
			System.err.println("Committed: "+indexWriter.getDirectory());
		} catch (IOException e) {
			throw new IQException(e.getMessage());
		}
	}

    public void clear() {
        try {
            this.indexWriter.deleteAll();
        } catch (IOException e) {
            log.error("urn:factcore:fact:finder:lucene:oops:clear#"+e.getMessage(),e);
        }
    }

	public void rollback() throws IQException {
		try {
			this.indexWriter.rollback();
		} catch (IOException e) {
			throw new IQException(e.getMessage());
		}
	}
}
