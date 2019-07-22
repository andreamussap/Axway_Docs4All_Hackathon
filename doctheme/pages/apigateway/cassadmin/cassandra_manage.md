---
title: Manage Cassandra
keywords: sample
summary: "This is just a sample topic..."
sidebar: apig_sidebar
permalink: cassandra_manage.html
folder: apigateway
---

# <span id="top"></span>Manage Apache Cassandra

On <span class="api_gateway_variablesunix_flavours">Linux</span>, when
you select to install Cassandra using the
<span class="api_gateway_variablesgateway">API Gateway</span> installer
as part of a Standard or Complete setup, Cassandra starts automatically.
To start or stop Cassandra manually or as a service, perform the steps
described in this topic.


|  | <span>**Note  **</span> | Before you start Cassandra, you must follow the best practices in [Apache Cassandra Best Practices](cassandra_BestPractices.htm) to achieve a stable Cassandra environment, and to prevent data integrity and performance issues. |



## Manage Apache Cassandra

This section explains how to start and stop Cassandra.

### Start Apache Cassandra

To start Cassandra in the background:

1.  Open a command prompt, and change to the following directory:

`$ cd CASSANDRA\_HOME/bin`

2.  Run the following command:

`$ ./cassandra`

To start Cassandra in the foreground, run the following command:

`$ ./cassandra -f`

For more details, see
<https://wiki.apache.org/cassandra/RunningCassandra>.

sample edit. added this text and deleted some text

  - **CentOS**:
  - [https://support.axway.com/kb/178063/language/en](https://support.axway.com/kb/178063/language/en "https://support.axway.com/kb/178063/language/en")
  - **Debian**:
  - [https://github.com/apache/cassandra/blob/cassandra-2.2/debian/init](https://github.com/apache/cassandra/blob/cassandra-2.2/debian/init "https://github.com/apache/cassandra/blob/cassandra-2.2/debian/init")

When startup scripts are configured, you can then start Cassandra as a
service.

|  | <span>**Note  **</span> | You must have root or sudo permissions to start Cassandra as a service. |

For example, typically the command to start Cassandra as a service is as follows:

`$ sudo service cassandra start`


### Stop Cassandra

1.  Find the Cassandra Java process ID (PID):

`$ ps auwx | grep cassandra`

1.  Run the following command:

`$ sudo kill *pid*`

### Stop Cassandra as a service

You must have `root` or `sudo` permissions to stop the Cassandra service
as follows:

`$ sudo service cassandra stop`

## Connect to API Gateway for the first time

Connecting to <span class="api_gateway_variablesgateway">API
Gateway</span> depends on your operating system and installation setup
type (Standard, Complete, or Custom).

### Standard or Complete setup

If you installed a default Standard or Complete setup (both include the
QuickStart tutorial), Cassandra is installed on the same host, and
listens on `localhost` by default.
<span class="api_gateway_variablesgateway">API Gateway</span> runs on
the same host and connects to Cassandra by default.

### Custom setup

If you installed a Custom setup and did not select the Quickstart
tutorial, you must update the
<span class="api_gateway_variablesgateway">API Gateway</span> Cassandra
client configuration as follows:

1.  Open the <span class="api_gateway_variablesgateway">API
    Gateway</span> group configuration in
    <span class="api_gateway_variablespolicy_studio">Policy
    Studio</span>.
2.  Select **Server Settings \> Cassandra \> Authentication**, and set
    the Cassandra username/password (default is
    `cassandra`/`cassandra`).
3.  Select **Server Settings \> Cassandra \> Hosts**. Add an address for
    the Cassandra node. You can enter an IP address or host name.
4.  Deploy the configuration to the
    <span class="api_gateway_variablesgateway">API Gateway</span> group.

For more details on configuring **Server Settings** in the
<span class="api_gateway_variablespolicy_studio">Policy Studio</span>
client, see [Cassandra
Settings](/csh?context=105&product=prod-api-gateway-77) in the
[<span class="api_gateway_variablesgateway">API Gateway</span>
Administrator
Guide](/bundle/APIGateway_77_AdministratorGuide_allOS_en_HTML5/). For
details on updating the Cassandra server configuration, see [Configure a
highly available Cassandra cluster](cassandra_config).

## Further details

For more details on Apache Cassandra, see the following:

  - <http://cassandra.apache.org/>
  - [http://docs.datastax.com/en/cassandra/2.2/](http://docs.datastax.com/en/cassandra/2.2/ "http://docs.datastax.com/en/cassandra/2.2/")

{% include links.html %}
