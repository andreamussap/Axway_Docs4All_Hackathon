---
title: Deployment architectures
keywords: sample
summary: "This is just a sample topic..."
sidebar: apig_sidebar
permalink: cassandra_architecture.html
folder: apigateway
---

# Cassandra deployment architectures

This topic describes the Apache Cassandra deployment architectures supported by
<span class="api_gateway_variablesgateway">API Gateway</span>. The
following table provides a summary:

<table>
<thead>
<tr class="header">
<th>Deployment</th>
<th>Description</th>
<th>Use</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><strong>Standalone</strong></td>
<td><p>One <span class="api_gateway_variablesgateway">API Gateway</span> instance only. This is the default.</p></td>
<td><ul>
<li>Development environment</li>
<li>Production environment with one <span class="api_gateway_variablesgateway">API Gateway</span> instance</li>
</ul></td>
</tr>
<tr class="even">
<td><strong>High availability with local storage</strong></td>
<td><p>Multiple <span class="api_gateway_variablesgateway">API Gateway</span> instances in a group, each <span class="api_gateway_variablesgateway">API Gateway</span> instance on different hosts, with a Cassandra storage node local to each <span class="api_gateway_variablesgateway">API Gateway</span> host.</p></td>
<td><ul>
<li>Pre-production environment</li>
<li>Production environment</li>
</ul></td>
</tr>
<tr class="odd">
<td><strong>High availability with remote storage</strong></td>
<td>Multiple <span class="api_gateway_variablesgateway">API Gateway</span> instances in a group, each <span class="api_gateway_variablesgateway">API Gateway</span> instance on different hosts, with Cassandra storage nodes on remote hosts.</td>
<td><ul>
<li>Pre-production environment</li>
<li>Production environment</li>
</ul></td>
</tr>
    <tr class="even">
<td><strong>Cassandra RDS Deployment</strong></td>
<td><p>lorem ipsum ipsum ipsum  <span class="api_gateway_variablesgateway">API Gateway</span> instances in a group, each <span class="api_gateway_variablesgateway">API Gateway</span> instance on different hosts, with a Cassandra storage node local to each <span class="api_gateway_variablesgateway">API Gateway</span> host.</p></td>
<td><ul>
<li>Pre-production environment</li>
<li>Production environment</li>
</ul></td>
</tr>
    
</tbody>
</table>

You can use one Cassandra cluster to store data from one or multiple <span class="api_gateway_variablesgateway">API Gateway</span> groups and one or multiple <span class="api_gateway_variablesgateway">API Gateway</span> domains. Your Cassandra topology does not need to match your API Gateway topology.

Multiple <span class="api_gateway_variablesgateway">API Gateway</span>
groups can also be deployed on the same host, each host running an
<span class="api_gateway_variablesgateway">API Gateway</span> instance
for each group. This applies to both local and remote storage.

{% include note.html content="Windows is supported only for a limited set of developer tools. API Gateway and API Manager do not support Windows. You can continue using an existing remote Cassandra installation running
on Windows that you have configured with your
API Gateway installation." %}

For details on hosting Cassandra in datacenters, see [Configure
<span class="api_management_variablesAPIManagementName">API
Management</span> in multiple
datacenters](/csh?context=303&product=prod-api-gateway-77) in the
[<span class="api_gateway_variablesgateway">API Gateway</span>
Installation
Guide](/bundle/APIGateway_77_InstallationGuide_allOS_en_HTML5/).

## Cassandra in standalone mode

Cassandra is configured in non-HA standalone mode when deployed
alongside a single <span class="api_gateway_variablesgateway">API
Gateway</span> instance on the same host (for example, in a
demonstration or development environment with one
<span class="api_gateway_variablesgateway">API Gateway</span> instance).
This is the default mode.

To configure Cassandra in standalone mode, perform the following steps:

1.  Ensure Cassandra is installed on the local node (along with
    <span class="api_gateway_variablesgateway">API Gateway</span>). For
    details, see [Install an Apache Cassandra
    database](/csh?context=301&product=prod-api-gateway-77) in the
    [<span class="api_gateway_variablesgateway">API Gateway</span>
    Installation
    Guide](/bundle/APIGateway_77_InstallationGuide_allOS_en_HTML5/).
2.  Start Cassandra before starting
    <span class="api_gateway_variablesgateway">API Gateway</span>. For
    details, see [Manage Apache Cassandra](cassandra_manage).
3.  Start <span class="api_gateway_variablesgateway">API Gateway</span>.
    For details, see the [<span class="api_gateway_variablesgateway">API
    Gateway</span> Installation
    Guide](/bundle/APIGateway_77_InstallationGuide_allOS_en_HTML5/).

The next steps depend on your installation setup type:

  - In a Standard or Complete setup that includes the QuickStart
    tutorial, the default configuration attempts to connect to Cassandra
    running on `localhost`.

<!-- end list -->

  - In a Custom setup without the QuickStart tutorial, you must
    configure the connection in
    <span class="suite_variablesPolicyStudioName">Policy Studio</span>.
    For more details, see [Connect to API Gateway for the first
    time](cassandra_manage.htm#Connect).

To use Cassandra with <span class="api_gateway_variablesapi_mgr">API
Manager</span>, see [Configure a highly available Cassandra
cluster](cassandra_config.htm#Update2). This is configured by default
when <span class="api_gateway_variablesapi_mgr">API Manager</span> is
installed along with the QuickStart tutorial.

To use Cassandra with OAuth, see [Deploy OAuth
configuration](/csh?context=400&product=prod-api-gateway-77) in the
[<span class="api_gateway_variablesgateway">API Gateway</span> OAuth
User Guide](/bundle/APIGateway_77_OAuthUserGuide_allOS_en_HTML5/).

The following diagram shows Cassandra in standalone mode with a default
Standard setup:
{% include image.html file="cassandra/cassandra_architecture_standalone.png" alt="Cassandra standalone architecture" %}


## <span id="Configur4"></span>Cassandra in High Availability mode

For both local and remote Cassandra HA, Cassandra runs on multiple
hosts. This section describes both scenarios.

### HA with local storage

In local Cassandra HA, Cassandra runs alongside
<span class="api_gateway_variablesgateway">API Gateway</span> on the
same host. This means that you do not need to provision separate host
machines for Cassandra and
<span class="api_gateway_variablesgateway">API Gateway</span>, or open
ports in your firewall. However, the data will be stored in the DMZ.
Local Cassandra HA enables minimum cost of ownership.

The following diagram shows local Cassandra HA mode:
{% include image.html file="cassandra/cassandra_architecture_local.png" alt="Local Cassandra HA architecture" %}


{% include note.html content="In this example, one of the Cassandra nodes runs without an API Gateway instance on the same host. This is because the minimum deployment architecture includes two API Gateway hosts and three Cassandra hosts. If you have three API Gateway instances, all Cassandra nodes are local." %}

### <span id="HA"></span>HA with remote storage

In remote Cassandra HA, Cassandra runs on a different host from
<span class="api_gateway_variablesgateway">API Gateway</span>. The main
differences when installing and configuring remote Cassandra are:

  - You must provision separate host machines for Cassandra and
    <span class="api_gateway_variablesgateway">API Gateway</span>.
    However, the data can be stored outside the DMZ, and there might be
    improved performance.
  - You might need to open ports in the firewall to connect to Cassandra
    outside the DMZ. For more details, see [Configure a highly available
    Cassandra cluster](cassandra_config.htm#Network).
  - You do not have to use the Cassandra component supplied by the
    <span class="api_gateway_variablesgateway">API Gateway</span>
    installer.
  - You can configure the remote node using the `setup-cassandra` script
    supplied by the <span class="api_gateway_variablesgateway">API
    Gateway</span> installation. For more details, see [setup-cassandra
    script reference](cassandra_setup_script). Alternatively, you
    can perform all necessary Cassandra configuration changes manually.
  - You must update the <span class="api_gateway_variablesgateway">API
    Gateway</span> Cassandra client settings in
    <span class="api_gateway_variablespolicy_studio">Policy
    Studio</span> to connect to the remote Cassandra host nodes.

The following diagram shows remote Cassandra HA mode:
{% include image.html file="cassandra/cassandra_architecture_remote.png" alt="Remote Cassandra HA architecture" %}

### Cassandra HA configuration

You can use a local or remote Cassandra HA configuration. The example
Cassandra HA configuration in the diagrams consists of the following:

  - Three Cassandra nodes in a single cluster.
  - Three host machines with network addresses: `ipA` (seed node),
    `ipB`, and `ipC`.
  - Replication factor of `3`. Each node holds 100% of the data.
  - Default values in `cassandra.yaml` for:
      - Server-server communication:  
        `listen_address` set to IP address  
        `storage_port` set to `7000`  
        `ssl_storage_port`: `7001` (when TLS v1.2 is configured)  
      - Client-server communication:  
        `native_transport_port` of `9042`
      - JMX monitoring on `localhost:7199`

{% include callout.html content="`ipA`, `ipB`, and `ipC` are placeholders for real host machines on
  your network. You can specify IP addresses or host names.<br/><br/>You must have at least one designated seed node. Seeds nodes are
  required at runtime when a node is added to the cluster. You can add
  more or change designation later.<br/><br/>You can change the server-server port, but it must be the same
  across the cluster.<br/><br/>For Cassandra administration, you must gain local access to the host
  machine (for example, using SSH) to perform administration tasks.
  This includes using `nodetool` to access the Cassandra cluster over
  JMX." type="primary" %}

### <span class="api_gateway_variablesgateway">API Gateway</span> configuration

<span class="api_gateway_variablesgateway">API Gateway</span> acts as a
client of the Cassandra cluster as follows:  

  - Client failover:  
    <span class="api_gateway_variablesgateway">API Gateway</span> can
    fail over to any of the Cassandra nodes for service. Each
    <span class="api_gateway_variablesgateway">API Gateway</span> is
    configured with the connection details of each Cassandra host.
  - Strong consistency:  
    Cassandra read and write consistency levels are both set to
    `QUORUM`. This, along with the replication factor of `3`, enables
    full availability in the event of one node loss.

{% include note.html content="You can have any number of API Gateway instances (all running either locally or remote to Cassandra). However, you must have at least two API Gateway instances for HA. This also applies to API Manager." %}


For more details on Cassandra HA configuration, see [Configure a highly
available Cassandra cluster](cassandra_config).

{% include links.html %}
