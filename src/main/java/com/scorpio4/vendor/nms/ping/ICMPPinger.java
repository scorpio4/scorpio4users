package com.scorpio4.vendor.nms.ping;
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
import com.factcore.util.Stopwatch;

import java.net.InetAddress;
import java.net.InterfaceAddress;
import java.util.*;
 
public class ICMPPinger implements Pinger {
 	int timeout = 1000;
    Stopwatch stopwatch = new Stopwatch();

	public ICMPPinger() {
		this(5);
 	}

	public ICMPPinger(int timeout) {
		this.timeout=timeout;
 	}

	public long ping(String host) throws java.net.UnknownHostException {
        stopwatch.reset();
		try {
			boolean status = InetAddress.getByName(host).isReachable(timeout);
			return status?stopwatch.elapsed():-1;
		} catch(java.io.IOException ioe) {
			return -2L;
		}
	}

    // List<InterfaceAddress> addresses
    public Map<String,Long> pingIf(List<InterfaceAddress> ifaddresses) {
        List<String> hosts = new ArrayList();
        for(InterfaceAddress addr:ifaddresses) {
            hosts.add(addr.getAddress().getHostAddress());
        }
        return ping(hosts);
    }


    public Map<String,Long> ping(Collection<String> hosts) {
        stopwatch.reset();
        Map results = new HashMap();
        for(String host:hosts) {
            try {
                boolean status = InetAddress.getByName(host).isReachable(timeout);
                results.put(host, status?stopwatch.elapsed():-1);
            } catch(java.io.IOException ioe) {
                results.put(host, -2);
            }
        }
        return results;
    }
}