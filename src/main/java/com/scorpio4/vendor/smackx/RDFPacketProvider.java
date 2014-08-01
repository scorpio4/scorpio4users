package com.scorpio4.vendor.smackx;

import com.scorpio4.vocab.COMMONS;
import org.jivesoftware.smack.packet.PacketExtension;
import org.jivesoftware.smack.provider.PacketExtensionProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.xmlpull.v1.XmlPullParser;

/**
 * Fact:Core (c) 2013
 * Module: com.factcore.vendor.smackx
 * User  : lee
 * Date  : 28/03/2014
 * Time  : 1:57 PM
 */
public class RDFPacketProvider implements PacketExtensionProvider {
    private static final Logger log = LoggerFactory.getLogger(RDFPacketProvider.class);

    public RDFPacketProvider() {
        log.debug("Found RDF:XML in XMPP");

    }

    @Override
    public PacketExtension parseExtension(XmlPullParser xmlPullParser) throws Exception {
log.debug("PacketExtension: "+xmlPullParser.getName());
        RDFPacketExtension rdfPacketExtension = new RDFPacketExtension("rdf:xml", COMMONS.MIME_TYPE);
        return rdfPacketExtension;
    }
}
