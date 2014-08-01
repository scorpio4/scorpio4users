package com.scorpio4.vendor.jung;
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

import com.scorpio4.fact.stream.FactStream;
import edu.uci.ics.jung.graph.Graph;
import edu.uci.ics.jung.graph.SparseMultigraph;
import org.openrdf.model.Resource;
import org.openrdf.model.Statement;
import org.openrdf.model.Value;
import org.openrdf.query.*;
import org.openrdf.repository.RepositoryConnection;
import org.openrdf.repository.RepositoryException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Fact:Core (c) 2012
 * User: lee
 * Date: 4/09/13
 * Time: 3:36 PM
 * <p/>
 *
 */
public class SesameGenerator {
	private static final Logger log = LoggerFactory.getLogger(SesameGenerator.class);
    RepositoryConnection conn = null;

    public SesameGenerator() {
    }

    public SesameGenerator(RepositoryConnection conn) {
        this.conn = conn;
	}

    public Graph generate(String query) throws RepositoryException, QueryEvaluationException, MalformedQueryException {
        GraphQuery graphQuery = conn.prepareGraphQuery(QueryLanguage.SPARQL, query);
        GraphQueryResult result = graphQuery.evaluate();
        Graph graph = generate(result);
        result.close();
        return graph;
    }

	public Graph generate(GraphQueryResult grq) throws QueryEvaluationException {
		return generate(new SparseMultigraph(),grq);
	}

	protected Graph generate(Graph graph, GraphQueryResult grq) throws QueryEvaluationException {
		int i = 0;
		while (grq.hasNext()) {
			Statement stmt = grq.next();
			Resource s = stmt.getSubject();
			Resource p = stmt.getPredicate();
			Value o = stmt.getObject();
			if (s!=null && p!=null && o!=null && o instanceof Resource) {
				graph.addEdge( p.stringValue(), s.stringValue(), o.stringValue() );
			}
		}
		return graph;
	}


    public static FactStream stream(final Graph graph) {
        return new StreamGraph(graph);
    }
}
