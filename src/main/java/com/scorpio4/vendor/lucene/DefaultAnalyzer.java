package com.scorpio4.vendor.lucene;
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
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.analysis.core.LowerCaseFilter;
import org.apache.lucene.analysis.en.PorterStemFilter;
import org.apache.lucene.analysis.standard.StandardTokenizer;
import org.apache.lucene.util.Version;

import java.io.Reader;

/**
 * FactCore (c) 2013
 * Module: com.factcore.fact.finder.lucene
 * User  : lee
 * Date  : 27/10/2013
 * Time  : 5:35 PM
 */
public class DefaultAnalyzer extends Analyzer {

    DefaultAnalyzer() {

    }

    @Override
    protected TokenStreamComponents createComponents(String s, Reader reader) {
        StandardTokenizer tokenStream = new StandardTokenizer(Version.LUCENE_45, reader);
        // tokenStream.setMaxTokenLength(maxTokenLength);
//        TokenStream result = new StandardFilter(tokenStream);
        TokenStream result = new LowerCaseFilter(Version.LUCENE_45, tokenStream);
//        result = new StopFilter();
        // add the PorterStemFilter
        return new TokenStreamComponents(null, new PorterStemFilter(result));
    }


}
