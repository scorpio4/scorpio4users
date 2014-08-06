package com.scorpio4.vendor.vaadin.model;

import com.vaadin.data.Item;
import com.vaadin.data.Property;

import java.util.Collection;
import java.util.Map;

/**
 * scorpio4-oss (c) 2014
 * Module: com.scorpio4.vendor.vaadin.model
 * User  : lee
 * Date  : 7/08/2014
 * Time  : 12:32 AM
 */
public class MapItem implements Item {
	protected Map valueMap = null;
	protected Map<Object, Class> propertyIds;

	public MapItem(Map valueMap, Map<Object, Class> propertyIds) {
		this.valueMap = valueMap;
		this.propertyIds=propertyIds;
	}
	/**
	 * Gets the Property corresponding to the given Property ID stored in the
	 * Item. If the Item does not contain the Property, <code>null</code> is
	 * returned.
	 *
	 * @param id identifier of the Property to get
	 * @return the Property with the given ID or <code>null</code>
	 */
	@Override
	public Property getItemProperty(Object id) {
		return new MapItemProperty(this,id);
	}

	/**
	 * Gets the collection of IDs of all Properties stored in the Item.
	 *
	 * @return unmodifiable collection containing IDs of the Properties stored
	 * the Item
	 */
	@Override
	public Collection<?> getItemPropertyIds() {
		return propertyIds.keySet();
	}

	/**
	 * Tries to add a new Property into the Item.
	 * <p/>
	 * <p>
	 * This functionality is optional.
	 * </p>
	 *
	 * @param id       ID of the new Property
	 * @param property the Property to be added and associated with the id
	 * @return <code>true</code> if the operation succeeded, <code>false</code>
	 * if not
	 * @throws UnsupportedOperationException if the operation is not supported.
	 */
	@Override
	public boolean addItemProperty(Object id, Property property) throws UnsupportedOperationException {
		throw new UnsupportedOperationException("Items Properties managed by Container");
	}

	/**
	 * Removes the Property identified by ID from the Item.
	 * <p/>
	 * <p>
	 * This functionality is optional.
	 * </p>
	 *
	 * @param id ID of the Property to be removed
	 * @return <code>true</code> if the operation succeeded
	 * @throws UnsupportedOperationException if the operation is not supported. <code>false</code> if not
	 */
	@Override
	public boolean removeItemProperty(Object id) throws UnsupportedOperationException {
		throw new UnsupportedOperationException("Items Properties managed by Container");
	}

	protected Map getValueMap() {
		return valueMap;
	}

}
class MapItemProperty implements Property {
	protected Object propertyID = null;
	protected MapItem item;

	public MapItemProperty(MapItem item, Object propertyID) {
		this.item=item;
		this.propertyID=propertyID;
	}

	/**
	 * Gets the value stored in the Property. The returned object is compatible
	 * with the class returned by getType().
	 *
	 * @return the value stored in the Property
	 */
	@Override
	public Object getValue() {
		return item.valueMap.get(propertyID);
	}

	/**
	 * Sets the value of the Property.
	 * <p>
	 * Implementing this functionality is optional. If the functionality is
	 * missing, one should declare the Property to be in read-only mode and
	 * throw <code>Property.ReadOnlyException</code> in this function.
	 * </p>
	 * <p/>
	 * Note : Since Vaadin 7.0, setting the value of a non-String property as a
	 * String is no longer supported.
	 *
	 * @param newValue New value of the Property. This should be assignable to the
	 *                 type returned by getType
	 * @throws com.vaadin.data.Property.ReadOnlyException if the object is in read-only mode
	 */
	@Override
	public void setValue(Object newValue) throws ReadOnlyException {
		item.valueMap.put(propertyID, newValue);
	}

	/**
	 * Returns the type of the Property. The methods <code>getValue</code> and
	 * <code>setValue</code> must be compatible with this type: one must be able
	 * to safely cast the value returned from <code>getValue</code> to the given
	 * type and pass any variable assignable to this type as an argument to
	 * <code>setValue</code>.
	 *
	 * @return type of the Property
	 */
	@Override
	public Class getType() {
		return item.propertyIds.get(propertyID);
	}

	/**
	 * Tests if the Property is in read-only mode. In read-only mode calls to
	 * the method <code>setValue</code> will throw
	 * <code>ReadOnlyException</code> and will not modify the value of the
	 * Property.
	 *
	 * @return <code>true</code> if the Property is in read-only mode,
	 * <code>false</code> if it's not
	 */
	@Override
	public boolean isReadOnly() {
		return false;
	}

	/**
	 * Sets the Property's read-only mode to the specified status.
	 * <p/>
	 * This functionality is optional, but all properties must implement the
	 * <code>isReadOnly</code> mode query correctly.
	 *
	 * @param newStatus new read-only status of the Property
	 */
	@Override
	public void setReadOnly(boolean newStatus) {
	}

	public boolean equals(MapItemProperty property) {
		return propertyID.equals(property.propertyID) && getValue().equals(property.getValue());
	}
}
