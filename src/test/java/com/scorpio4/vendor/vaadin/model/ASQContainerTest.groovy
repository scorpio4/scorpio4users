package com.scorpio4.vendor.vaadin.model
import com.scorpio4.asq.core.BasicASQ
import com.scorpio4.runtime.MockEngine
import com.scorpio4.vocab.COMMONS
/**
 * scorpio4-oss (c) 2014
 * Module: com.scorpio4.vendor.vaadin.model
 * User  : lee
 * Date  : 6/08/2014
 * Time  : 10:43 PM
 *
 *
 */
class ASQContainerTest extends GroovyTestCase {
	String queryURI = "urn:scorpio4tests:vaadin:container:";
	String itemURI = "http://scorpio4demo.com/v1/quickstart/";

	public void testContainerMeta() {
		MockEngine engine = new MockEngine();
		engine.provision("scorpio4/index.n3");
		def connection = engine.getRepository().getConnection();
		def asq = new BasicASQ(queryURI);
		asq.where(queryURI+"this", COMMONS.A, COMMONS.CORE + "Runtime")
		asq.where("?this", COMMONS.RDFS+"label", "?label")
		assert asq.getPatterns().size()==2;
		assert asq.getBindings().size()==2;

		ASQContainer asqContainer = new ASQContainer(connection, asq);
		assert asqContainer.size()==1;
		assert asqContainer.getContainerPropertyIds()!=null;
		assert asqContainer.getContainerPropertyIds().size()==2;
		assert asqContainer.getContainerPropertyIds().contains("label");
		assert asqContainer.getContainerPropertyIds().contains("this");
	}


	public void testContainerQuery() {
		MockEngine engine = new MockEngine();
		engine.provision("scorpio4/index.n3");
		def connection = engine.getRepository().getConnection();
		def asq = new BasicASQ(queryURI);
		asq.where(queryURI+"this", COMMONS.A, COMMONS.CORE + "Runtime")
		asq.where("?this", COMMONS.RDFS+"label", "?label")
		assert asq.getPatterns().size()==2;
		assert asq.getBindings().size()==2;

		ASQContainer asqContainer = new ASQContainer(connection, asq);
		assert asqContainer.size()==1;
		def item = asqContainer.getItem(itemURI)
		assert item!=null;
		def property = asqContainer.getContainerProperty(itemURI, "this")
		assert property!=null;
		assert property.getValue() == itemURI;
	}

	public void testSimpleModifications() {
		MockEngine engine = new MockEngine();
		engine.provision("scorpio4/index.n3");
		def connection = engine.getRepository().getConnection();
		def asq = new BasicASQ(queryURI);
		asq.where(queryURI+"this", COMMONS.A, COMMONS.CORE + "Runtime")
		asq.where("?this", COMMONS.RDFS+"label", "?label")
		assert asq.getPatterns().size()==2;
		assert asq.getBindings().size()==2;

		ASQContainer asqContainer = new ASQContainer(connection, asq);
		def property = asqContainer.getContainerProperty(itemURI, "label")
		assert property!=null;
		property.setValue("Tested");
		assert property.getValue() == "Tested";
		property = asqContainer.getContainerProperty(itemURI, "label")
		assert property.getValue() == "Tested";

		def item1 = asqContainer.addItem(asqContainer.addItem())
		assert item1!=null;
		assert asqContainer.size()==2;
		assert item1.getItemPropertyIds().containsAll( asqContainer.containerPropertyIds);
		def property1 = item1.getItemProperty("label")
		assert property1!=null;
		property1.setValue("Hello World");

		asqContainer.getItemIds().each {
			def item = (MapItem) asqContainer.getItem(it);
			println "> "+item.getValueMap();
		}

	}
}
