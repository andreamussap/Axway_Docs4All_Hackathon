# Perform essential <span class="api_gateway_variablescassandra">Apache Cassandra</span> operations

This topic describes the minimum essential operations that are required
to maintain a healthy
<span class="api_gateway_variablescassandra">Apache Cassandra</span>
high availability (HA) cluster.

## <span id="Perform"></span>Repair inconsistent nodes

<span class="api_gateway_variablescassandra">Apache Cassandra</span> has
different ways to maintain data consistency across the cluster during
normal runtime processing. However, to resolve any data inconsistencies
that could not be resolved by normal runtime processes, you must run an
external repair process on a regular basis.

For standard HA configurations, it is best to run repair once per week
(during a quiet period) on each node in the cluster.

|  | <span>**Caution  **</span> | The repair must only be executed on one node at a time. You must therefore adjust the repair schedule for each node in the cluster to avoid overlap. |

### Schedule repair using crontab

When scheduling Cassandra repair events, it is best to use the `crontab`
command of the user running the Cassandra process.

To edit the cron table of this user, execute `sudo crontab -u
CASSANDRA_USER -e` and paste the matching node block from the following
examples:

#### Example cron table entries for three-node cluster repairing one node per day (Saturday to Monday)

**Node 1**:

Run full repair at 1 a.m. every Saturday:

`0 1 \* \* 6 PATH\_TO\_CASSANDRA/bin/nodetool CONNECTION\_SECURITY\_PARAMS repair -pr --full \> PATH\_TO\_CASSANDRA/logs/last\_repair.log 2\>&1`

**Node 2**:

Run full repair at 1 a.m. every Sunday:

`0 1 \* \* 0 PATH\_TO\_CASSANDRA/bin/nodetool CONNECTION\_SECURITY\_PARAMS repair -pr --full \> PATH\_TO\_CASSANDRA/logs/last\_repair.log 2\>&1`

**Node 3**:

Run full repair at 1 a.m. every Monday:

`0 1 \* \* 1 PATH\_TO\_CASSANDRA/bin/nodetool CONNECTION\_SECURITY\_PARAMS repair -pr --full \> PATH\_TO\_CASSANDRA/logs/last\_repair.log 2\>&1`

See also [Clean up Cassandra repair
history](cassandra_BestPractices.htm#Clean).

## <span id="Replace"></span>Replace dead nodes

If a node is down for more than 10 days, it should be replaced. For
details on replacing dead Cassandra nodes, see the [Replacing a dead
node or dead seed
node](https://docs.datastax.com/en/archived/cassandra/2.2/cassandra/operations/opsReplaceNode.html)
documentation.

## Reconfigure an existing <span class="api_gateway_variablescassandra">Apache Cassandra</span> installation from scratch

There is no need to reinstall Cassandra from scratch. Instead, you can
move the Cassandra data files and restore the `cassandra.yaml`
configuration file if necessary (if you updated Cassandra
configuration). Perform the following steps:

1.  Stop Cassandra. For details, see [Manage Apache
    Cassandra](cassandra_manage.htm).
2.  Move `CASSANDRA_HOME/data` to `CASSANDRA_HOME/data/OLD-DATA-DATE`.
3.  Restore `cassandra.yaml` in `CASSANDRA_HOME/conf` if necessary.

## Enable <span class="api_gateway_variablescassandra">Apache Cassandra</span> debug logging

You can enable Cassandra debug logging using any of the following
approaches:

  - **logback.xml**

  You can specify a `logger` in the `cassandra/conf/logback.xml`
    configuration file as follows:

`<logger name "org.apache.cassandra.transport" level=DEBUG/\>`

  - **nodetool**

You can use the `nodetool setlogginglevel` command as follows:

`nodetool setlogginglevel org.apache.cassandra.transport DEBUG`

  - **JConsole**

The JConsole tool enables you to configure Cassandra logging using
    JMX. For example, you can invoke `setLoggingLevel` and specify
    `org.apache.cassandra.db.StorageServiceMBean` and `DEBUG` as
    parameters. For more details, see the next section.

For more details on enabling logging, see the following, which also
applies to Cassandra 2.2:

  - [https://docs.datastax.com/en/cassandra/2.1/cassandra/configuration/configLoggingLevels\_r.html](https://docs.datastax.com/en/cassandra/2.1/cassandra/configuration/configLoggingLevels_r.html "https://docs.datastax.com/en/cassandra/2.1/cassandra/configuration/configLoggingLevels_r.html")
  - [http://thelastpickle.com/blog/2016/02/10/locking-down-apache-cassandra-logging.html](http://thelastpickle.com/blog/2016/02/10/locking-down-apache-cassandra-logging.html "http://thelastpickle.com/blog/2016/02/10/locking-down-apache-cassandra-logging.html")

## <span id="Monitor"></span>Monitor a Cassandra cluster using JMX

You can use Java Management Extensions to monitor and manage performance
in a Cassandra cluster. For details, see the [Monitoring a Cassandra
cluster](https://docs.datastax.com/en/archived/cassandra/2.2/cassandra/operations/opsMonitoring.html)
documentation.

## Upgrade your Cassandra version

For details on upgrading your Cassandra version, see [Upgrade Apache
Cassandra](/csh?context=801&product=prod-api-gateway-77) in the
[<span class="api_gateway_variablesgateway">API Gateway</span> Upgrade
Guide](/bundle/APIGateway_77_UpgradeGuide_allOS_en_HTML5).
