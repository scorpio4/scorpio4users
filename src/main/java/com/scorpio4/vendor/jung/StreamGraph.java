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

import com.scorpio4.fact.stream.FactStream;
import com.scorpio4.oops.FactException;
import edu.uci.ics.jung.graph.Graph;
import edu.uci.ics.jung.graph.SparseMultigraph;

/**
 * Scorpio4 (c) 2013
 * Module: com.factcore.vendor.jung
 * User  : lee
 * Date  : 12/01/2014
 * Time  : 12:23 AM
 */
public class StreamGraph implements FactStream {
    Graph graph = null;
    String identity = "urn:factcore:vendor:jung:stream:Graph";

    public StreamGraph(Graph graph) {
        this.graph=graph;
    }

    public StreamGraph() {
        this.graph=new SparseMultigraph();
    }

    public StreamGraph(String id, Graph graph) {
        this.identity=id;
        this.graph=graph;
    }

    public Graph getGraph() {
        return graph;
    }

    @Override
    public void fact(String s, String p, Object o) throws FactException {
        graph.addEdge(p, s, o.toString());
    }

    @Override
    public void fact(String s, String p, Object o, String xsdType) throws FactException {
        graph.addEdge(p, s, o.toString());
    }

    @Override
    public String getIdentity() {
        return identity;
    }
}
