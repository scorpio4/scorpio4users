package com.scorpio4.vendor.vaadin.model;

import com.scorpio4.assets.Asset;
import com.scorpio4.assets.AssetRegister;
import com.scorpio4.runtime.ExecutionEnvironment;
import com.scorpio4.vendor.sesame.util.SesameHelper;
import com.scorpio4.vocab.COMMONS;
import com.sun.xml.internal.ws.Closeable;
import com.vaadin.data.Item;
import com.vaadin.data.util.BeanItem;
import org.openrdf.repository.Repository;
import org.openrdf.repository.RepositoryConnection;
import org.openrdf.repository.RepositoryException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.vaadin.addons.lazyquerycontainer.Query;
import org.vaadin.addons.lazyquerycontainer.QueryDefinition;
import org.vaadin.addons.lazyquerycontainer.QueryFactory;

import java.io.IOException;
import java.util.*;

/**
 * scorpio4-oss (c) 2014
 * Module: com.scorpio4.vendor.vaadin.model
 * User  : lee
 * Date  : 4/08/2014
 * Time  : 9:24 PM
 */
public class AssetQueryFactory implements QueryFactory, Closeable {
	private static final long serialVersionUID = 2014080500L;
	protected final Logger log = LoggerFactory.getLogger(getClass());

	String queryURI;
	AssetRegister assetRegister;
	RepositoryConnection connection = null;
	Map bind = new HashMap();

	public AssetQueryFactory(String queryURI, ExecutionEnvironment engine) throws RepositoryException {
		this.queryURI=queryURI;
		this.connection = engine.getRepository().getConnection();
		this.assetRegister=engine.getAssetRegister();
		this.bind.putAll(engine.getConfig());
	}

	public AssetQueryFactory(String queryURI, Repository repository, AssetRegister assetRegister) throws RepositoryException {
		this.queryURI=queryURI;
		this.connection = repository.getConnection();
		this.assetRegister=assetRegister;
	}

	@Override
	public Query constructQuery(QueryDefinition queryDefinition) {
		log.debug("constructQuery() "+queryDefinition);
		return new AssetQuery(this, queryDefinition);
	}

	public Asset getQuery(String queryMethod) throws IOException {
		return assetRegister.getAsset(queryURI+queryMethod, COMMONS.MIME_SPARQL);
	}

	@Override
	public void close() {
		try {
			this.connection.close();
		} catch (RepositoryException e) {
			log.error("Connection Closing Error",e);
		}
	}
}

class AssetQuery implements Query {
	protected final Logger log = LoggerFactory.getLogger(getClass());

	AssetQueryFactory assetQueryFactory;
	List<Item> loaded = new ArrayList();
	QueryDefinition queryDefinition;

	public AssetQuery(AssetQueryFactory assetQueryFactory, QueryDefinition queryDefinition) {
		this.assetQueryFactory=assetQueryFactory;
		this.queryDefinition=queryDefinition;
	}

	@Override
	public int size() {
		log.debug("loaded() "+loaded.size());
		return loaded.size();
	}

	@Override
	public List<Item> loadItems(int start, int count) {
		log.debug("loadItems() "+start+", "+count);
		try {
			Asset asset = assetQueryFactory.getQuery("read");
			String sparql = asset.getContent()+" LIMIT "+start+", "+count;
			Collection<Map> results = SesameHelper.toMapCollection(assetQueryFactory.connection, sparql);
			loaded.clear();
			for(Map result:results) {
				loaded.add(new BeanItem<Map>(result));
			}
		} catch (Exception e) {
			log.debug("loadItems() Failed",e);
		}
		return loaded;
	}

	@Override
	public void saveItems(List<Item> added, List<Item> modified, List<Item> removed) {
		log.debug("saveItem() ");
		// TODO:
	}

	@Override
	public boolean deleteAllItems() {
		log.debug("deleteAllItems() ");
		return false;
	}

	@Override
	public Item constructItem() {
		log.debug("constructItem() ");
		return new BeanItem<Map>(new HashMap());
	}
}