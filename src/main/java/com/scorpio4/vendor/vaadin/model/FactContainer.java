package com.scorpio4.vendor.vaadin.model;

import com.scorpio4.fact.stream.FactStream;
import com.scorpio4.iq.bean.ConvertsType;
import com.scorpio4.iq.bean.XSD2POJOConverter;
import com.scorpio4.oops.FactException;
import com.vaadin.data.Container;
import com.vaadin.data.Item;
import com.vaadin.data.Property;
import com.vaadin.data.util.IndexedContainer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Collection;
import java.util.Map;

/**
 * scorpio4-oss (c) 2014
 * Module: com.scorpio4.vendor.vaadin.model
 * User  : lee
 * Date  : 4/08/2014
 * Time  : 9:02 PM
 */
public class FactContainer implements Container, FactStream {
	private static final Logger log = LoggerFactory.getLogger(FactContainer.class);
	private Container container = null;
	protected String idProperty = "this";
	ConvertsType convertsType = new XSD2POJOConverter();

	public FactContainer() {
		this(new IndexedContainer());
	}

	public FactContainer(Container container) {
		this.container=container;
	}

	public FactContainer(Container container, Collection<Map<String, Object>> models) {
		this(container);
		container.removeAllItems();
		add(models);
	}

	public FactContainer(Collection<Map<String, Object>> models) {
		this();
		add(models);
	}

	public void add(Collection<Map<String,Object>> models) {
		int was = container.size();
		for(Map<String,Object> model:models) {
			add(model);
		}
		log.debug("Container added: "+models.size()+" models. Was: "+was+", now: "+container.size());
	}

	public void add(Map<String,Object> model) {
		Object id = model.get(idProperty);
		if (id==null) throw new IllegalArgumentException("urn:factcore:vendor:vaadin:model:stream:container:oops:missing-id#"+idProperty);
		Item item = container.addItem(id);
		if (item==null) {
			item = container.getItem(id);
			log.debug("strange-item#"+id+" -> "+item);
			if (item==null) {
				log.debug("missing-item#"+id);
//			throw new IllegalArgumentException("urn:factcore:vendor:vaadin:model:stream:container:oops:invalid-item#"+id);
				return;
			}
		}
		setItemProperties(container,item,model);
	}

	public void setItemProperties(Container container, Item item, Map<String,Object> model) {
		for(String key: model.keySet()) {
			Object value = model.get(key);
			setItemProperty(container, item, key, value);
		}
	}

	protected void setItemProperty(Container container, Item item, String key, Object value) {
		Property property = item.getItemProperty(key);
		// we haven't seen the key, then add it ...
		if (key!=null && (property==null||property.getType()==null) ) {
			boolean added = container.addContainerProperty(key, value==null?String.class:value.getClass(), null);
			property = item.getItemProperty(key);
			log.trace("property: "+added+"] "+key+" -> "+property.getValue());
		}
		if (property!=null) {
			if (value==null) property.setValue(null);
			else {
				// convert then set value (defensively)
				try {
					Object converted = convertsType.convertToType(value.toString(),property.getType());
					log.trace("converted: "+key+" -> "+converted+" ==> "+converted.getClass()+" as "+property.getType());
					property.setValue( converted );
				} catch(IllegalArgumentException e) {
					log.error("urn:factcore:vendor:vaadin:model:stream:container:oops:invalid-conversion#", e);
				}
			}
		}
	}

	@Override
	public void fact(String s, String p, Object o) throws FactException {
		Item item = container.addItem(s);
		setItemProperty(container, item, p, o);
	}

	@Override
	public void fact(String s, String p, Object o, String xsdType) throws FactException {
		Item item = container.addItem(s);
		setItemProperty(container, item,p, o);
	}

	@Override
	public String getIdentity() {
		return "bean:"+getClass().getCanonicalName();
	}

	public Container getContainer() {
		return this.container;
	}

	// Implement Container interface by Delegation

	@Override
	public Item getItem(Object itemId) {
		return container.getItem(itemId);
	}

	@Override
	public Collection<?> getContainerPropertyIds() {
		return container.getContainerPropertyIds();
	}

	@Override
	public Collection<?> getItemIds() {
		return container.getItemIds();
	}

	@Override
	public Property getContainerProperty(Object itemId, Object propertyId) {
		return container.getContainerProperty(itemId, propertyId);
	}

	@Override
	public Class<?> getType(Object propertyId) {
		return container.getType(propertyId);
	}

	@Override
	public int size() {
		return container.size();
	}

	@Override
	public boolean containsId(Object itemId) {
		return container.containsId(itemId);
	}

	@Override
	public Item addItem(Object itemId) throws UnsupportedOperationException {
		return container.addItem(itemId);
	}

	@Override
	public Object addItem() throws UnsupportedOperationException {
		return container.addItem();
	}

	@Override
	public boolean removeItem(Object itemId) throws UnsupportedOperationException {
		return container.removeItem(itemId);
	}

	@Override
	public boolean addContainerProperty(Object propertyId, Class<?> type, Object defaultValue) throws UnsupportedOperationException {
		return container.addContainerProperty(propertyId,type,defaultValue);
	}

	@Override
	public boolean removeContainerProperty(Object propertyId) throws UnsupportedOperationException {
		return container.removeContainerProperty(propertyId);
	}

	@Override
	public boolean removeAllItems() throws UnsupportedOperationException {
		return container.removeAllItems();
	}
}
