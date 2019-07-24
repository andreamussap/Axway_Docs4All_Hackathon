---
title: Best practices
keywords: sample
summary: "This is a topic about Cassandra best practices"
sidebar: apig_sidebar
permalink: cassandra_BestPractices.html
folder: apigateway
---


## New section
Testing update in git

# <span class="api_gateway_variablescassandra">Apache Cassandra</span> best practices

Follow the best practices in this section to achieve a stable
<span class="api_gateway_variablescassandra">Apache Cassandra</span>
environment, and to prevent data integrity and performance issues. You
must complete all of these tasks before you start
<span class="api_gateway_variablescassandra">Apache Cassandra</span>.

## Clock synchronization and health check

The clocks of the system across all Cassandra cluster machines and the
clocks of all client machines
(<span class="api_gateway_variablesgateway">API Gateway</span> hosts)
must be synchronized to one (1) millisecond precision.

Failing to synchronize the clocks will result in:

  - Faults in data synchronization
  - Failure to start or configure the machines correctly

The clock synchronization requires the use of a time service, such as
NTP (Network Time Protocol), to ensure that the time is synchronized
across all machines in the cluster.

You must also perform a health check of the clock drift between nodes on
a regular basis.

## User account

You must create a specific <span class="suite_variablesUNIX">UNIX</span>
user account for the Cassandra database. This user account must own all
Cassandra related files, and it must be used to run the Cassandra
process.

This guide refers to this user account as `cassandra_user`.

## Required system tuning

Cassandra executes basic performance and tuning checks at startup, and
it writes warning messages to the console and to the system log file
when issues are found.

These are examples of warnings for a misconfigured Cassandra host:

<table>
<tbody>
<tr class="odd">
<td><code>WARN Unable to lock JVM memory (ENOMEM). This can result in part of the JVM being swapped out,
     especially with mmapped I/O enabled. Increase RLIMIT_MEMLOCK or run Cassandra as root
WARN jemalloc shared library could not be preloaded to speed up memory allocations
WARN Cassandra server running in degraded mode. Is swap disabled? : true,
     Address space adequate? : true, nofile limit adequate? : false, nproc limit adequate? : false</code></td>
</tr>
</tbody>
</table>

Perform the following procedures to ensure that each Cassandra machine
meets the basic tuning requirements.

|  | <span>**Note  **</span> | The following commands apply for Red Hat 7.x. If you are using another <span class="api_gateway_variablesunix_flavours">Linux</span> distribution, consult your system administrator. |

### Install jemalloc

Ensure that `jemalloc` is installed.

1.  Run the command `rpm -q jemalloc` to check if jemalloc is installed.
2.  If jemalloc is not installed, run the following command to install
    it from `epel`:

<table>
<tbody>
<tr class="odd">
<td><code>sudo rpm -iv https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
sudo yum install -y jemalloc</code></td>
</tr>
</tbody>
</table>

### Turn swap off

Ensure that you turn `swap` off.

|  | <span>**Note  **</span> | <span class="api_gateway_variablescassandra">Apache Cassandra</span> recommends that `swap` is disabled. If your company policies or production environment requires `swap` to be `on` for other processes, you must ensure that the Cassandra process is not `swapped out` at any time. |

1.  The line `cat/proc/swaps` in the `/etc/fstab` file should show `NO
    entries`. If entries are present, execute the following command to
    disable all swap entries currently active:
```console
sudo swapoff -a sad
````    
2.  Delete all swap entries in `/etc/fstab` to ensure that swap is not
    enabled again when the machine is restarted.

### Set limits for user account

Set the minimum limits for the user account.

If running with a console or `init.d`, create a
`/etc/security/limits.d/cassandra.conf` file, and add the following
lines to it (replace `cassandra_user` with the relevant user account).

<table>
<tbody>
<tr class="odd">
<td><code>&lt;cassandra_user&gt; - memlock unlimited
&lt;cassandra_user&gt; - nofile 100000
&lt;cassandra_user&gt; - nproc 32768
&lt;cassandra_user&gt; - as unlimited</code></td>
</tr>
</tbody>
</table>

If running via a system service, ensure that the following lines are
present in the `[SERVICE]` section of the Cassandra service file:

<table>
<tbody>
<tr class="odd">
<td><code>LimitMEMLOCK=infinity
LimitNOFILE=100000
LimitNPROC=32768
LimitAS=infinityd</code></td>
</tr>
</tbody>
</table>

## <span id="Clean"></span>Clean up Cassandra repair history

By default <span class="api_gateway_variablescassandra">Apache
Cassandra</span> 2.2.x does *not* clean up `nodetool repair` trace
history. This can cause the `system_distributed` keyspace to increase in
size over time. The extent of the issue can be seen by running the
following command to see how much space is being consumed by
`system_distributed`:

<table>
<tbody>
<tr class="odd">
<td><code>du -md 1 &lt;cassandra_root&gt;/data/data/ | sort -n</code></td>
</tr>
</tbody>
</table>

To prevent this, it is recommended that you set a 7 day TTL on the
repair history tables and remove any existing data. First, execute the
following using `cqlsh` on one of the Cassandra nodes:

<table>
<tbody>
<tr class="odd">
<td><code>ALTER TABLE system_distributed.repair_history WITH default_time_to_live = 604800;
TRUNCATE system_distributed.repair_history;
ALTER TABLE system_distributed.parent_repair_history WITH default_time_to_live = 604800;
TRUNCATE system_distributed.parent_repair_history;</code></td>
</tr>
</tbody>
</table>

To reclaim the disk space, clean up the snapshots generated by the
truncate by executing the following against all Cassandra nodes:

<table>
<tbody>
<tr class="odd">
<td><code>nodetool clearsnapshot system_distributed</code></td>
</tr>
</tbody>
</table>

### Further information

See also [Perform essential Apache Cassandra
operations](cassandra_ops).

{% include links.html %}
