package com.scorpio4.vendor.vaadin.model;

import com.scorpio4.asq.ASQ;
import com.scorpio4.asq.core.Term;
import com.scorpio4.asq.sparql.SelectSPARQL;
import com.scorpio4.util.bean.XSD2POJOConverter;
import com.scorpio4.oops.FactException;
import com.scorpio4.template.PicoTemplate;
import com.scorpio4.util.IdentityHelper;
import com.scorpio4.vendor.sesame.util.SesameHelper;
import com.vaadin.data.Container;
import com.vaadin.data.Item;
import com.vaadin.data.Property;
import org.openrdf.model.Literal;
import org.openrdf.query.*;
import org.openrdf.repository.RepositoryConnection;
import org.openrdf.repository.RepositoryException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

/**
 * scorpio4-oss (c) 2014
 * Module: com.scorpio4.vendor.vaadin.model
 * User  : lee
 * Date  : 4/08/2014
 * Time  : 9:07 PM
 */
public class ASQContainer implements Container {
	private static final Logger log = LoggerFactory.getLogger(ASQContainer.class);
	protected ASQ asq = null;
	protected Map bindings = null;
	protected Map<Object, MapItem> items = new HashMap();
	protected Map<Object, Class> propertyClasses = new HashMap();
	protected Collection removed = new ArrayList();
	protected RepositoryConnection connection = null;
	protected String idAttribute = "this";

	public ASQContainer(RepositoryConnection connection, ASQ asq) throws Exception {
		init(connection, asq, new HashMap());
	}

	public ASQContainer(RepositoryConnection connection, ASQ asq, Map bindings) throws Exception {
		init(connection, asq, bindings);
	}

	private void init(RepositoryConnection connection, ASQ asq, Map bindings) throws Exception {
		this.connection = connection;
		this.asq=asq;
		mapBindingsToProperties();
		read(bindings);
	}

	private void mapBindingsToProperties() {
		propertyClasses.clear();
		Map<String, Term> termMap = asq.getBindings();
		for(String termKey: termMap.keySet()) {
			Term term = termMap.get(termKey);
			if (termKey.startsWith("?")) termKey=termKey.substring(1);
			propertyClasses.put(termKey, term.getTypeClass());
		}
	}

	public void read(Map bindings) throws Exception {
		SelectSPARQL selectSPARQL = new SelectSPARQL(asq);
		PicoTemplate template = new PicoTemplate(selectSPARQL.toString());

		String sparql = SesameHelper.explodePragmas(connection, template.translate(bindings));
		XSD2POJOConverter convertsType = new XSD2POJOConverter();
		TupleQuery tuple = connection.prepareTupleQuery(QueryLanguage.SPARQL, sparql);
		TupleQueryResult result = tuple.evaluate();

		while(result.hasNext()) {
			BindingSet bindingSet = result.next();
			log.trace("SPARQL binding: "+bindingSet.getBindingNames());
			Map map = new HashMap();
			for(Binding name:bindingSet) {
				if (convertsType!=null && name.getValue() instanceof Literal) {
					Literal literal = (Literal)name.getValue();
					if (literal.getDatatype()!=null) {
						Class aClass = XSD2POJOConverter.convertXSDToClass(literal.getDatatype().stringValue());
						map.put(name.getName(), convertsType.convertToType(literal.stringValue(), aClass) );
					} else
						map.put(name.getName(), name.getValue().stringValue());
				}
				else
					map.put(name.getName(), name.getValue().stringValue());
			}
			Object id = map.get(idAttribute);
			if (id==null) throw new FactException("Missing mandatory ?"+idAttribute);
			items.put(id, new MapItem(map, propertyClasses));
		}
		log.trace("SPARQL found: "+items.size()+" items");	}

	/**
	 * Gets the {@link com.vaadin.data.Item} with the given Item ID from the Container. If the
	 * Container does not contain the requested Item, <code>null</code> is
	 * returned.
	 * <p/>
	 * Containers should not return Items that are filtered out.
	 *
	 * @param itemId ID of the {@link com.vaadin.data.Item} to retrieve
	 * @return the {@link com.vaadin.data.Item} with the given ID or <code>null</code> if the
	 * Item is not found in the Container
	 */
	@Override
	public Item getItem(Object itemId) {
		return items.get(itemId);
	}

	/**
	 * Gets the ID's of all Properties stored in the Container. The ID's cannot
	 * be modified through the returned collection.
	 *
	 * @return unmodifiable collection of Property IDs
	 */
	@Override
	public Collection<?> getContainerPropertyIds() {
		return propertyClasses.keySet();
	}

	/**
	 * Gets the ID's of all visible (after filtering and sorting) Items stored
	 * in the Container. The ID's cannot be modified through the returned
	 * collection.
	 * <p/>
	 * If the container is {@link com.vaadin.data.Container.Ordered}, the collection returned by this
	 * method should follow that order. If the container is {@link com.vaadin.data.Container.Sortable},
	 * the items should be in the sorted order.
	 * <p/>
	 * Calling this method for large lazy containers can be an expensive
	 * operation and should be avoided when practical.
	 *
	 * @return unmodifiable collection of Item IDs
	 */
	@Override
	public Collection<?> getItemIds() {
		return items.keySet();
	}

	/**
	 * Gets the Property identified by the given itemId and propertyId from the
	 * Container. If the Container does not contain the item or it is filtered
	 * out, or the Container does not have the Property, <code>null</code> is
	 * returned.
	 *
	 * @param itemId     ID of the visible Item which contains the Property
	 * @param propertyId ID of the Property to retrieve
	 * @return Property with the given ID or <code>null</code>
	 */
	@Override
	public Property getContainerProperty(Object itemId, Object propertyId) {
		Item item = getItem(itemId);
		if (item == null) {
			return null;
		}
		return item.getItemProperty(propertyId);
	}

	/**
	 * Gets the data type of all Properties identified by the given Property ID.
	 *
	 * @param propertyId ID identifying the Properties
	 * @return data type of the Properties
	 */
	@Override
	public Class<?> getType(Object propertyId) {
		Term term = asq.getBindings().get(propertyId);
		return term.getTypeClass();
	}

	/**
	 * Gets the number of visible Items in the Container.
	 * <p/>
	 * Filtering can hide items so that they will not be visible through the
	 * container API.
	 *
	 * @return number of Items in the Container
	 */
	@Override
	public int size() {
		return items.size();
	}

	/**
	 * Tests if the Container contains the specified Item.
	 * <p/>
	 * Filtering can hide items so that they will not be visible through the
	 * container API, and this method should respect visibility of items (i.e.
	 * only indicate visible items as being in the container) if feasible for
	 * the container.
	 *
	 * @param itemId ID the of Item to be tested
	 * @return boolean indicating if the Container holds the specified Item
	 */
	@Override
	public boolean containsId(Object itemId) {
		return items.containsKey(itemId);
	}

	/**
	 * Creates a new Item with the given ID in the Container.
	 * <p/>
	 * <p>
	 * The new Item is returned, and it is ready to have its Properties
	 * modified. Returns <code>null</code> if the operation fails or the
	 * Container already contains a Item with the given ID.
	 * </p>
	 * <p/>
	 * <p>
	 * This functionality is optional.
	 * </p>
	 *
	 * @param itemId ID of the Item to be created
	 * @return Created new Item, or <code>null</code> in case of a failure
	 * @throws UnsupportedOperationException if adding an item with an explicit item ID is not supported
	 *                                       by the container
	 */
	@Override
	public Item addItem(Object itemId) throws UnsupportedOperationException {
		HashMap map = new HashMap();
		map.put(idAttribute, itemId);
		MapItem item = new MapItem(map, propertyClasses);
		items.put(itemId, item);
		removed.remove(itemId);
		return item;
	}

	/**
	 * Creates a new Item into the Container, and assign it an automatic ID.
	 * <p/>
	 * <p>
	 * The new ID is returned, or <code>null</code> if the operation fails.
	 * After a successful call you can use the {@link #getItem(Object ItemId)
	 * <code>getItem</code>}method to fetch the Item.
	 * </p>
	 * <p/>
	 * <p>
	 * This functionality is optional.
	 * </p>
	 *
	 * @return ID of the newly created Item, or <code>null</code> in case of a
	 * failure
	 * @throws UnsupportedOperationException if adding an item without an explicit item ID is not
	 *                                       supported by the container
	 */
	@Override
	public Object addItem() throws UnsupportedOperationException {
		return IdentityHelper.uuid(asq.getIdentity());
	}

	/**
	 * Removes the Item identified by <code>ItemId</code> from the Container.
	 * <p/>
	 * <p>
	 * Containers that support filtering should also allow removing an item that
	 * is currently filtered out.
	 * </p>
	 * <p/>
	 * <p>
	 * This functionality is optional.
	 * </p>
	 *
	 * @param itemId ID of the Item to remove
	 * @return <code>true</code> if the operation succeeded, <code>false</code>
	 * if not
	 * @throws UnsupportedOperationException if the container does not support removing individual items
	 */
	@Override
	public boolean removeItem(Object itemId) throws UnsupportedOperationException {
		MapItem remove = items.remove(itemId);
		removed.add(itemId);
		return remove!=null;
	}

	/**
	 * Adds a new Property to all Items in the Container. The Property ID, data
	 * type and default value of the new Property are given as parameters.
	 * <p/>
	 * This functionality is optional.
	 *
	 * @param propertyId   ID of the Property
	 * @param type         Data type of the new Property
	 * @param defaultValue The value all created Properties are initialized to
	 * @return <code>true</code> if the operation succeeded, <code>false</code>
	 * if not
	 * @throws UnsupportedOperationException if the container does not support explicitly adding container
	 *                                       properties
	 */
	@Override
	public boolean addContainerProperty(Object propertyId, Class<?> type, Object defaultValue) throws UnsupportedOperationException {
		throw new UnsupportedOperationException("removeContainerProperty() constrained by ASQ: "+asq.getIdentity());
	}

	/**
	 * Removes a Property specified by the given Property ID from the Container.
	 * Note that the Property will be removed from all Items in the Container.
	 * <p/>
	 * This functionality is optional.
	 *
	 * @param propertyId ID of the Property to remove
	 * @return <code>true</code> if the operation succeeded, <code>false</code>
	 * if not
	 * @throws UnsupportedOperationException if the container does not support removing container
	 *                                       properties
	 */
	@Override
	public boolean removeContainerProperty(Object propertyId) throws UnsupportedOperationException {
		throw new UnsupportedOperationException("removeContainerProperty() constrained by ASQ: "+asq.getIdentity());
	}

	/**
	 * Removes all Items from the Container.
	 * <p/>
	 * <p>
	 * Note that Property ID and type information is preserved. This
	 * functionality is optional.
	 * </p>
	 *
	 * @return <code>true</code> if the operation succeeded, <code>false</code>
	 * if not
	 * @throws UnsupportedOperationException if the container does not support removing all items
	 */
	@Override
	public boolean removeAllItems() throws UnsupportedOperationException {
		for(Object id: items.keySet())  removeItem(id);
		return true;
	}

	public void close() {
		try {
			if (connection.isOpen()) connection.close();
		} catch (RepositoryException e) {
			log.error(e.getMessage(), e);
		}
	}

}