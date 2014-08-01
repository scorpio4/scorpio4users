package com.scorpio4.vendor.sesame.source;
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
import com.factcore.vocab.CORE;
import com.factcore.core.Configurable;
import com.factcore.core.CoreConfig;
import com.factcore.fact.source.FactGraph;
import com.factcore.fact.source.FactInferrer;
import com.factcore.fact.source.FactLearner;
import com.factcore.fact.source.FactSource;
import com.factcore.fact.stream.FactStream;
import com.factcore.fact.stream.FactStreamer;
import com.factcore.fact.stream.N3Stream;
import com.factcore.factory.QueryFactory;
import com.factcore.factory.ScriptFactory;
import com.factcore.oops.ConfigException;
import com.factcore.oops.FactException;
import com.factcore.oops.IQException;
import com.factcore.template.PicoTemplate;
import com.factcore.util.string.PrettyString;
import com.factcore.vendor.sesame.io.SPARQLer;
import com.factcore.vendor.sesame.io.SesameLoader;
import com.factcore.vendor.sesame.stream.SesameStreamReader;
import com.factcore.vendor.sesame.stream.SesameStreamWriter;
import com.factcore.vendor.sesame.util.ValueTypeConverter;
import org.openrdf.model.BNode;
import org.openrdf.model.Namespace;
import org.openrdf.model.Statement;
import org.openrdf.model.URI;
import org.openrdf.query.*;
import org.openrdf.repository.Repository;
import org.openrdf.repository.RepositoryConnection;
import org.openrdf.repository.RepositoryException;
import org.openrdf.repository.http.HTTPQueryEvaluationException;
import org.openrdf.repository.http.HTTPRepository;
import org.openrdf.repository.sail.SailRepository;
import org.openrdf.sail.nativerdf.NativeStore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.net.URL;
import java.util.*;

public class SesameFactSource implements Configurable, FactGraph, FactSource, FactLearner, FactInferrer, QueryFactory, FactStreamer {
	private static final Logger log = LoggerFactory.getLogger(SesameFactSource.class);

	private QueryFactory queryFactory = null;

	final ValueTypeConverter converter = new ValueTypeConverter();
	private RepositoryConnection connection;
	private String namespaces = "";
	private String prefix = "";
    CoreConfig config = null;

    public SesameFactSource() {
	}

	public SesameFactSource(CoreConfig config) throws ConfigException {
		init(config);
	}

    public SesameFactSource(Map config) throws ConfigException {
        configure(config);
    }

    /*
	public SesameFactSource(Identifiable id, Repository repo, QueryFactory queryFactory) throws RepositoryException, FactException {
		init(repo.getConnection(),queryFactory);
		log.debug("Created CoreFinder with Repository");
	}
*/

    @Override
    public void configure(Map config) throws ConfigException {
        init(new CoreConfig(config));
    }

	public void init(CoreConfig config) throws ConfigException {
        this.config = config;
        Repository repository;
        if (config.getRepositoryURL()!=null&&!config.getRepositoryURL().equals("")) {
            repository = new HTTPRepository( config.getRepositoryURL() );
            repository.setDataDir(config.getHome());
        } else {
            if (config.getHome()==null)
                throw new ConfigException("urn:factcore:fact:finder:sparql:oops:repository-homeless" );
            String id = PrettyString.sanitize(config.getIdentity());
			File storeHome = new File(config.getHome(),id);
            repository = new SailRepository(new NativeStore(storeHome, "spoc"));
			log.debug("Created native repository: "+id+" in "+storeHome.getAbsolutePath());
            try {
                repository.setDataDir(config.getHome());
                repository.initialize();
            } catch (RepositoryException e) {
                throw new ConfigException("urn:factcore:fact:finder:sparql:oops:sail-repository-failed#"+e.getMessage(),e );
            }
        }
        log.debug("Using : " + config.getIdentity() + " initialized: " + repository.isInitialized());
		try {
			init(repository.getConnection(), new ScriptFactory( this, config.getHome()));
		} catch (RepositoryException e) {
			throw new ConfigException("urn:factcore:fact:finder:sparql:oops:repository-failed#"+e.getMessage(),e );
		} catch (IQException e) {
            throw new ConfigException("urn:factcore:fact:finder:sparql:oops:repository-io#"+e.getMessage(),e );
        } catch (FactException e) {
            throw new ConfigException("urn:factcore:fact:finder:sparql:oops:script-factory-failed#"+e.getMessage(),e );
        }
	}

	public void init(RepositoryConnection conn, QueryFactory queryFactory) throws RepositoryException, FactException {
		this.setConnection(conn);
		this.setQueryFactory(queryFactory);

		if (getIdentity()==null) throw new FactException("Identity is undefined");
		if (getQueryFactory()==null) throw new FactException("QueryFactory is undefined");
		if (getConnection()==null) throw new FactException("Connection is undefined");

		this.setNamespaces("");
		this.setPrefix("");
		// defensive namespaces
		conn.setNamespace("fact", CORE.FACT);
		conn.setNamespace("iq", CORE.ASSETS);
		conn.setNamespace("rdf", CORE.RDF);
		conn.setNamespace("rdfs", CORE.RDFS);
		conn.setNamespace("owl", CORE.OWL);
		// cache prefix strings
		List<Namespace> namespaces = conn.getNamespaces().asList();
		StringBuilder prefix$ = new StringBuilder();
		StringBuilder namespace$ = new StringBuilder();
		for(Namespace namespace: namespaces) {
			namespace$.append("prefix ").append(namespace.getPrefix()).append(": <").append(namespace.getName()).append( ">\n");
			prefix$.append("@prefix ").append(namespace.getPrefix()).append(": <").append(namespace.getName()).append( ">.\n");
		}
		this.setNamespaces(namespace$.toString());
		this.setPrefix(prefix$.toString());
		log.debug("Initialized CoreFinder: "+conn);
	}

	public static String toSPARQLNamespaces(RepositoryConnection conn) throws RepositoryException {
		List<Namespace> namespaces = conn.getNamespaces().asList();
		StringBuilder namespace$ = new StringBuilder();
		for(Namespace namespace: namespaces) {
			namespace$.append("prefix ").append(namespace.getPrefix()).append(": <").append(namespace.getName()).append( ">\n");
		}
		return namespace$.toString();
	}

	public void stop() throws FactException {
        try {
            getConnection().close();
        } catch (RepositoryException e) {
            throw new FactException("urn:factcore:fact;finder:sparql:close#"+e.getMessage(),e);
        }
    }

	public boolean isRunning() {
		if (null == getConnection()) return false;
		try {
			return getConnection().isOpen();
		} catch (Exception e) {
			return false;
		}
	}

	public String query(String raw_query, Map meta) throws ConfigException {
		validateMetaQuery(raw_query, meta);
		String query = raw_query.trim();

        boolean alreadySPARQL = query.startsWith("#") || query.startsWith("SELECT ") || query.startsWith("CONSTRUCT ") || query.startsWith("DESCRIBE ") || query.startsWith("INSERT ")|| query.startsWith("DELETE ");

		if (!alreadySPARQL) {
			query = getQueryFactory().query(query, meta);
			log.debug("Resolving query: "+raw_query+" -> "+query+", factory: "+getQueryFactory());
        }
        if (query==null) throw new ConfigException("‰:sparql:oops:unknown-query#"+raw_query);

		try {
			PicoTemplate template = new PicoTemplate(query);
			query = template.translate(meta);
			log.debug("Full Query: "+query);
			return query;
		} catch (Exception e) {
			log.debug("Faulty sparql: "+query);
			throw new ConfigException("Failed to bind query parameter's", e);
		}
	}

	private void validateMetaQuery(String raw_query, Map meta) throws ConfigException {
		if (raw_query == null || raw_query.equals("")) throw new ConfigException("urn:factcore:fact:finder:sparql:missing-query#"+raw_query);
		if (meta == null) throw new ConfigException("urn:factcore:fact:finder:sparql:meta-data-missing");
	}

	public Collection list(String raw_query, Map meta) throws ConfigException, FactException {
        String query = query(raw_query, meta);
        if (query==null) throw new FactException("urn:factcore:fact:finder:sparql:missing-query#"+raw_query);
        if (getConnection()==null) throw new FactException("urn:factcore:fact:finder:sparql:missing-connection#");

		try {
			TupleQuery tupleQuery = getConnection().prepareTupleQuery(new QueryLanguage("SPARQL"), getNamespaces() + query);
			return list(tupleQuery);
		} catch (HTTPQueryEvaluationException e) {
			throw new ConfigException("List query error for: " + raw_query+" -> "+query, e);
		} catch (Exception e) {
			throw new FactException(e.getMessage()+" for: " + raw_query, e);
		}
	}

	public List list(TupleQuery tupleQuery) throws Exception {
		List my_list = new ArrayList();
		TupleQueryResult results = tupleQuery.evaluate();
		while (results.hasNext()) {
			BindingSet set = results.next();
			Map map = new HashMap();
			Set names = set.getBindingNames();
			for (Iterator j = names.iterator(); j.hasNext(); ) {
				String name = (String) j.next();
				map.put(name, converter.convert(set.getValue(name)));
			}
			my_list.add(map);
		}

		results.close();
		return my_list;
	}

	public Map models(String raw_query, Map model) throws FactException {
		String query = null;
		try {
			query = query(raw_query, model);
		} catch (ConfigException e) {
			throw new FactException("Query failed: " + raw_query, e);
		}
		String fqQuery = getNamespaces() + query;
		try {
			TupleQuery tupleQuery = getConnection().prepareTupleQuery(new QueryLanguage("SPARQL"), fqQuery);
			return model(raw_query, tupleQuery);
		} catch (QueryEvaluationException e) {
			throw new FactException("Query failed: " + fqQuery, e);
		} catch (RepositoryException e) {
			throw new FactException("Repository failed: " + raw_query, e);
		} catch (MalformedQueryException e) {
			throw new FactException("Query syntax error: " + fqQuery, e);
		}
	}

	public Map model(String defaultNamespace, TupleQuery tupleQuery) throws FactException, QueryEvaluationException {
		Map model = new HashMap();
		TupleQueryResult results = tupleQuery.evaluate();
		while (results.hasNext()) {
			BindingSet set = results.next();
			Map map = new HashMap();
			Set names = set.getBindingNames();
			for (Iterator j = names.iterator(); j.hasNext(); ) {
				String name = (String) j.next();
				map.put(name, converter.convert(set.getValue(name)));
			}
			if (map.get("this")==null) {
				if (map.get("id")==null) throw new FactException("Model requires ?this or ?id");
				map.put("this", defaultNamespace+"#id="+map.get("id"));
				model.put(map.get("this"), map);
			} else {
				model.put(map.get("this"), map);
			}
		}

		results.close();
		return model;
	}

	public Collection pivot(String query, Map meta) throws FactException, ConfigException {
		Collection results = list(query, meta);
		meta.put(query, results);
		return results;
	}

	public void learn(String raw_query, Map meta) throws FactException {
		update(raw_query, meta);
	}

	public int update(String raw_query, Map meta) throws FactException {
        String query = null;
        try {
            query = query(raw_query, meta);
            if (query==null) {
                throw new FactException("urn:factcore:fact:finder:sparql:oops:unknown-query#"+raw_query);
            }
			Update updateQuery = getConnection().prepareUpdate(QueryLanguage.SPARQL, getNamespaces() + query);
			updateQuery.execute();
			commit();
		} catch (Exception e) {
			log.error("LEARN ERROR: " + e.getMessage() + ": " + query + "---> " + String.valueOf(meta));
			throw new FactException(e.getMessage(), e);
		}
		return 0;
	}

	public int infer(String raw_query, Map meta, String ctx) throws FactException, ConfigException {
		String query = query(raw_query, meta);
		if (query==null) return -1;
		try {
			SPARQLer SPARQLer = new SPARQLer(getConnection(), ctx);
			return SPARQLer.copy( getNamespaces() + query);
		} catch (RepositoryException e) {
			throw new FactException("Infer to repository failed: "+e.getMessage(),e);
		} catch (QueryEvaluationException e) {
			throw new FactException("Infer query failed: "+e.getMessage(),e);
		} catch (MalformedQueryException e) {
			throw new FactException("Syntax error in infer query: "+e.getMessage(),e);
		}
	}

	public int infer(String query, Map meta) throws FactException, ConfigException {
		return infer(query, meta, query);
	}

	public boolean load(URL url, String baseURI) throws FactException {
		SesameLoader sesameLoader = new SesameLoader(getConnection());
		return sesameLoader.load(url, baseURI);
	}

    public boolean load(File n3, String baseURI) throws FactException {
		SesameLoader sesameLoader = new SesameLoader(getConnection());
		try {
			return sesameLoader.load(n3, baseURI);
		} catch (RepositoryException e) {
			throw new FactException("Failed to load() N3 into repository", e);
		}
	}

	public void forget(String ctx, Map model) throws FactException {
		try {
			getConnection().setAutoCommit(false);
			if (ctx!=null) {
				URI context = getConnection().getValueFactory().createURI(ctx);
				getConnection().clear(context);
			} else {
				getConnection().clearNamespaces();
				getConnection().clear();
			}
			getConnection().commit();
		} catch(RepositoryException e) {
			throw new FactException("Repository clear() failed", e);
		} finally {
			try {
				getConnection().rollback();
			} catch (RepositoryException e) {
				throw new FactException("Repository rollback() failed", e);
			}
		}
	}

	public void prepare() throws FactException {
	}

	public void begin() throws FactException {
		try {
			getConnection().setAutoCommit(false);
		} catch (RepositoryException e) {
			throw new FactException("Begin transaction failed", e);
		}
	}

	public void commit() throws FactException {
		try {
			getConnection().commit();
			getConnection().setAutoCommit(true);
		} catch (RepositoryException e) {
			throw new FactException("Commit failed", e);
		}
	}

	public void rollback() throws FactException {
		try {
			getConnection().rollback();
		} catch (RepositoryException e) {
			throw new FactException("Rollback failed", e);
		}
	}

	public RepositoryConnection getConnection() {
		return connection;
	}

	public void setConnection(RepositoryConnection connection) {
		this.connection = connection;
	}

	public QueryFactory getQueryFactory() {
		return queryFactory;
	}

	public void setQueryFactory(QueryFactory queryFactory) {
		this.queryFactory = queryFactory;
	}

	public String getNamespaces() {
		return namespaces;
	}

	public void setNamespaces(String namespaces) {
		this.namespaces = namespaces;
	}

	public String getPrefix() {
		return prefix;
	}

	public void setPrefix(String prefix) {
		this.prefix = prefix;
	}

	public String getIdentity() {
		return config.getIdentity();
	}

	public String toString() {
		return "SesameCore: "+getIdentity();
	}

	@Override
	public Map graph(String raw_query, Map meta) throws FactException, ConfigException {
		String query = query(raw_query, meta);
		if (query==null) return null;
		List triples = new ArrayList();
		Map prefixes = new HashMap();
		try {
            log.warn("Graph Query: " + query + " -> " + getQueryFactory());
			GraphQuery graphQuery = getConnection().prepareGraphQuery(QueryLanguage.SPARQL, getNamespaces() + query);
			GraphQueryResult result = graphQuery.evaluate();
			while (result.hasNext()) {
				Statement stmt = result.next();
				Map map = new HashMap();
				if (stmt.getSubject() instanceof BNode) {
					map.put("s", stmt.getSubject() );
//					log.debug("BNODE (S): "+ stmt);
				} else {
					map.put("s", stmt.getSubject().toString());
//					log.debug("URI (S): "+ stmt);
				}
				map.put("p", stmt.getPredicate().toString());
				map.put("o", stmt.getObject() ) ;
				if (stmt.getContext()!=null) map.put("c", stmt.getContext().toString());
				triples.add(map);
			}
			result.close();
			List<Namespace> namespaces = getConnection().getNamespaces().asList();
			for(Namespace namespace: namespaces) {
				prefixes.put(namespace.getPrefix(), namespace.getName());
			}

		} catch (RepositoryException e) {
			throw new FactException("Repository failed: "+e.getMessage(), e);
		} catch (QueryEvaluationException e) {
			throw new FactException("Query failed: "+e.getMessage()+"\n"+query, e);
		} catch (MalformedQueryException e) {
			throw new FactException("Query error: "+e.getMessage()+"\n"+query, e);
		}
		Map facts = new HashMap();
		facts.put("triples", triples);
		facts.put("namespaces", prefixes);
		return facts;
	}

    @Override
    public void learn(String context_uri, N3Stream n3s) throws FactException {
        SesameLoader sesameLoader = new SesameLoader(getConnection());
        try {
            sesameLoader.load(n3s, context_uri);
        } catch (FactException e) {
            throw new FactException("Failed to learn", e);
        }
    }

    /**
     * Execute a query, and populate the FactStream with the results
     *
     * @param raw_query
     * @param map
     * @param stream
     * @return
     * @throws FactException
     */
    public FactStream pull(String raw_query, Map map, FactStream stream) throws FactException {
        try {
            SesameStreamReader reader = new SesameStreamReader(getConnection(), stream);
            String query = getNamespaces()+query(raw_query, map );
            log.debug("Pull Stream: "+query);
            reader.stream(query, map);
            return stream;
        } catch (ConfigException e) {
            throw new FactException("urn:factcore:fact:finder:sparql:stream:read:oops:config-failed#"+e.getMessage(), e);
        } catch (FactException e) {
            throw new FactException("urn:factcore:fact:finder:sparql:stream:read:oops:kernel-failed#"+e.getMessage(), e);
        }
    }

    /**
     * Create a FactStream for writing
     *
     * */

    public FactStream push(String context_uri) throws FactException {
        try {
            return new SesameStreamWriter(getConnection(), context_uri);
        } catch (RepositoryException e) {
            throw new FactException("urn:factcore:fact:finder:sparql:stream:read:oops:repository-failed#"+e.getMessage(), e);
        }
    }

    @Override
    public void done(FactStream stream) throws FactException {
        if (SesameStreamWriter.class.isInstance(stream)) {
            SesameStreamWriter ssw = (SesameStreamWriter)stream;
            ssw.done();
        }
    }

    @Override
    public Map getConfiguration() {
        return config.getConfiguration();
    }
}
