package com.scorpio4.vendor.jung;
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

import cern.colt.matrix.impl.SparseDoubleMatrix2D;
import edu.uci.ics.jung.algorithms.cluster.EdgeBetweennessClusterer;
import edu.uci.ics.jung.algorithms.flows.EdmondsKarpMaxFlow;
import edu.uci.ics.jung.algorithms.matrix.GraphMatrixOperations;
import edu.uci.ics.jung.algorithms.scoring.BetweennessCentrality;
import edu.uci.ics.jung.algorithms.shortestpath.DijkstraShortestPath;
import edu.uci.ics.jung.graph.DirectedGraph;
import edu.uci.ics.jung.graph.Graph;
import edu.uci.ics.jung.graph.SparseMultigraph;
import org.apache.commons.collections15.Factory;
import org.apache.commons.collections15.Transformer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.PrintStream;
import java.util.*;

/**
 * Scorpio4 (c) 2012
 * User: lee
 * Date: 4/09/13
 * Time: 6:25 PM
 * <p/>
 * This code does something useful
 */
public class GraphAnalysis {
	private static final Logger log = LoggerFactory.getLogger(GraphAnalysis.class);

	public GraphAnalysis() {
	}

    public static Graph empty() {
        return new SparseMultigraph();
    }

	public SortedMap centrality(Graph graph) {
		BetweennessCentrality centrality = new BetweennessCentrality(graph);
		Iterator i = graph.getVertices().iterator();
		final Map unsorted = new HashMap();
		while(i.hasNext()) {
			Object v = i.next();
			double c = centrality.getVertexScore(v);
			unsorted.put(v, new Double(c) );
//			log.debug("Found: ", v);
		}
		return sort(unsorted);
	}

	public SparseDoubleMatrix2D adjacency(Graph graph) {
		return GraphMatrixOperations.graphToSparseMatrix(graph);
	}

	public Set edgeBetweenness(Graph graph, int numEdgesToRemove) {
		return cluster(graph, new EdgeBetweennessClusterer(numEdgesToRemove));
	}

	public Set cluster(Graph graph, Transformer t) {
		return (Set)t.transform(graph);
	}

	protected SortedMap sort(final Map unsorted) {
//		final Map unsorted = _unsorted;
		Comparator rankedOrder =  new Comparator() {
			@Override
			public int compare(Object o1, Object o2) {
				Double d1 = (Double)unsorted.get(o1);
				Double d2 = (Double)unsorted.get(o2);
				Double c = d2 - d1;
				if (c==0.0) return 0;
				return c>0?1:-1;
			}
		};
		TreeMap<String,Double> sorted_map = new TreeMap<String,Double>(rankedOrder);
		sorted_map.putAll(unsorted);
		return sorted_map;
	}

	protected SortedMap sort(final Map<String,Double> unsorted, int limit) {
		Comparator rankedOrder =  new Comparator() {
			@Override
			public int compare(Object o1, Object o2) {
				Double d1 = (Double)unsorted.get(o1);
				Double d2 = (Double)unsorted.get(o2);
				Double c = d2 - d1;
				if (c==0.0) return 0;
				return c>0?1:-1;
			}
		};

		TreeMap<String,Double> sortedLimited = new TreeMap<String,Double>(rankedOrder);
		int i = 0;
		for(String k: unsorted.keySet()) {
			if ((i++)>=limit) break;
			sortedLimited.put(k, unsorted.get(k));

		}
		return sortedLimited;
	}

    public Collection route(Graph graph, String from, String to) {
        DijkstraShortestPath alg = new DijkstraShortestPath(graph);
        return alg.getPath(from, to);
    }

    public Collection maxflow(DirectedGraph graph, String from, String to, String key) {
        final String _key = key;
        Transformer capTransformer =
                new Transformer<Map, Double>(){
                    public Double transform(Map link) {
                        Object o = link.get(_key);
                        if (o==null) new Double(0);
                        return Double.parseDouble(o.toString());
                    }
                };
        Map edgeFlowMap = new HashMap();
        // This Factory produces new edges for use by the algorithm
        Factory edgeFactory = new Factory() {
            public String create() {
                return "x";
            }
        };
        EdmondsKarpMaxFlow<Map, Map> alg = new EdmondsKarpMaxFlow(graph, from, to, capTransformer, edgeFlowMap, edgeFactory);
        alg.evaluate();
        System.out.println("The max flow is: " + alg.getMaxFlow());
        System.out.println("The edge set is: " + alg.getMinCutEdges().toString());
        return alg.getMinCutEdges();
    }

	public void debug(Map map, int top) {
		debug(map, top, System.err);
	}

	public void debug(Map map, int top, PrintStream writer) {
		int i = 0;
		for(Object k: map.keySet()) {
			if ((i++)>=top) break;
			writer.printf("> %f %s%n", map.get(k), k);
		}
		writer.flush();
	}

}
