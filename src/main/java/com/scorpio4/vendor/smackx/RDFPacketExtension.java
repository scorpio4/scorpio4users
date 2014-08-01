package com.scorpio4.vendor.smackx;

import com.scorpio4.fact.stream.FactStream;
import com.scorpio4.oops.FactException;
import org.jivesoftware.smack.packet.DefaultPacketExtension;
import org.openrdf.model.Statement;
import org.openrdf.model.impl.LiteralImpl;
import org.openrdf.model.impl.StatementImpl;
import org.openrdf.model.impl.URIImpl;
import org.openrdf.query.GraphQueryResult;
import org.openrdf.query.QueryEvaluationException;
import org.openrdf.rio.RDFFormat;
import org.openrdf.rio.RDFHandlerException;
import org.openrdf.rio.RDFWriter;
import org.openrdf.rio.Rio;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.StringWriter;

/**
 * Fact:Core (c) 2013
 * Module: com.factcore.vendor.smackx
 * User  : lee
 * Date  : 27/03/2014
 * Time  : 8:00 PM
 */
public class RDFPacketExtension extends DefaultPacketExtension implements FactStream {
    private static final Logger log = LoggerFactory.getLogger(RDFPacketExtension.class);

    StringWriter xml =  new StringWriter();
    RDFFormat format = RDFFormat.RDFXML;
    RDFWriter writer = Rio.createWriter(format, xml);

    public RDFPacketExtension(String elementName, String namespace) {
        super(elementName, namespace);
    }

    public void setRDF(GraphQueryResult result) throws QueryEvaluationException, RDFHandlerException {
        while (result.hasNext()) {
            Statement stmt = result.next();
            writer.handleStatement(stmt);
        }
    }


    public String toXML() {
        return xml.toString();
    }

    @Override
    public void fact(String s, String p, Object o) throws FactException {
        Statement stmt = new StatementImpl(new URIImpl(s), new URIImpl(p), new URIImpl(o.toString()));
        try {
            writer.startRDF();
            writer.handleStatement(stmt);
        } catch (RDFHandlerException e) {
            log.debug("Invalid RDF in stream: "+s+" "+p+" "+o);
            e.printStackTrace();
        }
    }

    @Override
    public void fact(String s, String p, Object o, String xsdType) throws FactException {
        try {
            writer.startRDF();
            Statement stmt = new StatementImpl(new URIImpl(s), new URIImpl(p), new LiteralImpl(o.toString(), new URIImpl(xsdType)));
            writer.handleStatement(stmt);
        } catch (RDFHandlerException e) {
            log.debug("Invalid RDF in stream: "+s+" "+p+" "+o);
            e.printStackTrace();
        }
    }

    @Override
    public String getIdentity() {
        return getNamespace()+getElementName();
    }
}
