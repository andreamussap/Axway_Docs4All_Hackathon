---
title: Configure HA
keywords: sample
summary: "This is just a sample topic..."
sidebar: apig_sidebar
permalink: cassandra_config.html
folder: apigateway
---

# <span id="top"></span>Configure a highly available Cassandra cluster

This topic describes how to set up an Apache Cassandra database cluster
for high availability (HA) of your
<span class="api_gateway_variablesgateway">API Gateway</span> system.

## Cassandra HA in a production environment

To tolerate the loss of one Cassandra node and to ensure 100% data
consistency, <span class="api_gateway_variablesgateway">API
Gateway</span> requires at a minimum the following Cassandra cluster
configuration running in a production class environment:

  - Three Cassandra nodes (with one seed node)
  - `QUORUM` read/write consistency to ensure that you are reading from
    a quorum of Cassandra nodes (two) every time
  - `Replication factor` setting set to `3`, so each node holds 100% of
    the data

If one Cassandra node fails or needs to be restarted, the cluster
continues to operate with the remaining two nodes. This configuration
applies to all supported use cases (for example,
<span class="suite_variablesAPIManagerName">API Manager</span> and
<span class="api_gateway_variablesgateway">API Gateway</span> custom
KPS, OAuth, and client registry data).

### Preparing a Cassandra HA environment

The following general guidelines apply to configuring a Cassandra HA
cluster:

  - Decide on the number of Cassandra nodes, and install and configure
    the Cassandra database on each node.
  - Decide on the number of
    <span class="api_gateway_variablesgateway">API Gateway</span> nodes,
    and install and configure them (local or remote to Cassandra).
  - Create a HA API Gateway environment.
  - Configure the Cassandra client settings in
    <span class="api_gateway_variablespolicy_studio">Policy
    Studio</span> for the <span class="api_gateway_variablesgateway">API
    Gateway</span> group.

For details on how to install an
<span class="api_gateway_variablescassandra">Apache Cassandra</span>
database or how to create a HA
<span class="api_gateway_variablesgateway">API Gateway</span>
environment, see [<span class="api_gateway_variablesgateway">API
Gateway</span> Installation
Guide](/bundle/APIGateway_77_InstallationGuide_allOS_en_HTML5/).

## <span id="Example"></span>Example of a HA setup using three Cassandra nodes

This section shows how to configure a three nodes Cassandra HA cluster.

### Configure the Cassandra seed node

Perform the following steps to configure a *seed* node:

1.  Assign one of the nodes as the *seed* node, and connect to it via
    SSH.
2.  Update the `CASSANDRA_HOME/conf/cassandra.yaml` file manually or
    using the `setup-cassandra` script.  
    Manually:
```yaml
seed_provider, parameters, seeds: IP_SEED_NODE
start_native_transport: true
start_rpc: false
native_transport_port: 9042
listen_address: IP_SEED_NODE
rpc_address: IP_SEED_NODE
authenticator: org.apache.cassandra.auth.PasswordAuthenticator
authorizer: org.apache.cassandra.auth.CassandraAuthorizer
````
3.  Using the `setup-cassandra` script:
```console
setup-cassandra --seed --own-ip=<IP_SEED_NODE> --nodes=3 --cassandra-config=CONFIG_FILE
````
4.  Start Cassandra.
5.  Verify the `CASSANDRA_HOME/logs/system.log` does not contain any
    errors or warnings.
6.  Run the `nodetool status` command to verify that *one* node is
    present in `UN` status, and that the IP address is correct.

### Configure the additional Cassandra nodes

The procedure to configure additional nodes uses the `seed` node that
you have previously configured.

|  | <span>**Note  **</span> | You must repeat these steps for each additional node. |

1.  Connect to the additional node via SSH, and update the
    `CASSANDRA_HOME/conf/cassandra.yaml` file.  
    Manually:
```yaml
seed_provider, parameters, seeds: IP_SEED_NODE
start_native_transport: true
start_rpc: false
native_transport_port: 9042
listen_address: IP_NODE_N
rpc_address: IP_NODE_N
authenticator: org.apache.cassandra.auth.PasswordAuthenticator
authorizer: org.apache.cassandra.auth.CassandraAuthorizer
````
2.  Using the `setup-cassandra` script:
```console
setup-cassandra --seed-ip=<IP_SEED_NODE> --own-ip=<IP_NODE_n> --cassandra-config=<PATH_TO_CASSANDRA.YAML>
````
3.  Start Cassandra.  
4.  Verify the `CASSANDRA_HOME/logs/system.log` does not contain any
    errors or warnings.
5.  Run the `nodetool status` command to verify that the *new* node is
    present in `UN` status, and that the IP address is correct.

### Create a new Cassandra database user

From the command line, execute the following commands to create a new
user:
```sql
>./cqlsh <IP_NODE_1> -u cassandra -p cassandra

> ALTER KEYSPACE "system_auth" WITH REPLICATION = { 'class': 'SimpleStrategy', 'replication_factor': 3 };

> CREATE USER <USERNAME> WITH PASSWORD '<PASSWORD>' SUPERUSER;

> QUIT;

>./cqlsh <IP_NODE_1> -u <ADMIN_USERNAME> -p <PASSWORD>

> ALTER USER cassandra WITH PASSWORD '<PASSWORD>' NOSUPERUSER;

> QUIT
````

### Configure the <span class="api_gateway_variablesgateway">API Gateway</span> Cassandra client connection


|  | <span>**Note  **</span> | This section assumes that you have already set up a HA API Gateway environment. For details, see [<span class="api_gateway_variablesgateway">API Gateway</span> Administrator Guide](/bundle/APIGateway_77_AdministratorGuide_allOS_en_HTML5/) |

In <span class="api_gateway_variablespolicy_studio">Policy
Studio</span>, open your <span class="api_gateway_variablesgateway">API
Gateway</span> group configuration.

1.  Select **Server Settings \> Cassandra \> Authentication**, and enter
    the cassandra database user name and password.
2.  Select **Server Settings \> Cassandra \> Hosts**, and add a host for
    each Cassandra node in the cluster.
3.  Select **Server Settings \> Cassandra \> Keyspace**, and set the
    **Initial replication factor** option to `3`.
4.  Deploy the configuration to the group.

## Configure the client settings for <span class="api_gateway_variablesgateway">API Gateway</span> or <span class="api_gateway_variablesapi_mgr">API Manager</span>


|  | <span>**Note  **</span> | You need at least two <span class="api_gateway_variablesgateway">API Gateway</span>s in a group for HA. |

This section describes the following options:

  - [Configure API Gateway Cassandra client settings](#APIGWClient)
  - [Configure API Manager Cassandra client settings](#APIMngrClient)

### <span id="APIGWClient"></span>Configure <span class="api_gateway_variablesgateway">API Gateway</span> Cassandra client settings

To update the Cassandra client configuration for
<span class="api_gateway_variablesgateway">API Gateway</span>, perform
the following steps:

#### <span id="Configur5"></span>Configure the <span class="api_gateway_variablesgateway">API Gateway</span> domain

1.  Ensure <span class="api_gateway_variablesgateway">API Gateway</span>
    has been installed on the
    <span class="api_gateway_variablesgateway">API Gateway</span> 1 and
    <span class="api_gateway_variablesgateway">API Gateway</span> 2
    nodes. For details, see the
    [<span class="api_gateway_variablesgateway">API Gateway</span>
    Installation
    Guide](/bundle/APIGateway_77_InstallationGuide_allOS_en_HTML5/).
2.  Ensure an <span class="api_gateway_variablesgateway">API
    Gateway</span> domain has been created on the
    <span class="api_gateway_variablesgateway">API Gateway</span> 1 node
    using `managedomain`. For more details, see [Configure an
    <span class="api_gateway_variablesgateway">API Gateway</span>
    domain](/csh?context=102&product=prod-api-gateway-77) in the
    [<span class="api_gateway_variablesgateway">API Gateway</span>
    Administrator
    Guide](/bundle/APIGateway_77_AdministratorGuide_allOS_en_HTML5/).

#### <span id="Configur6"></span>Configure the <span class="api_gateway_variablesgateway">API Gateway</span> Cassandra client connection

1.  In <span class="api_gateway_variablespolicy_studio">Policy
    Studio</span>, open your
    <span class="api_gateway_variablesgateway">API Gateway</span> group
    configuration.
2.  Select **Server Settings \> Cassandra \> Authentication**, and enter
    your Cassandra user name and password (both default to `cassandra`).
3.  Select **Server Settings \> Cassandra \> Hosts**, and add an address
    for each Cassandra node in the cluster (`ipA`, `ipB` and `ipC` in
    this example).


|  | <span>**Tip  **</span> | You can automate these steps by running the `updateCassandraSettings.py` script against a deployment package (`.fed`). For more details, see [Configure a highly available Cassandra cluster](#Automate). |

#### <span id="Configur7"></span>Configure the <span class="api_gateway_variablesgateway">API Gateway</span> Cassandra consistency levels

1.  Ensure that the **API Server** KPS collection has been created under
    **Environment Configuration \> Key Property Stores**. This is
    required to configure Cassandra consistency levels, and is created
    automatically if you installed the **Complete** setup type.

    If you installed the **Custom** or **Standard** setup, you must
    configure OAuth or <span class="api_gateway_variablesapi_mgr">API
    Manager</span> settings in
    <span class="api_gateway_variablespolicy_studio">Policy
    Studio</span> to create the required KPS collections. For more
    details, see:
    *  [Deploy OAuth
        configuration](/csh?context=400&product=prod-api-gateway-77) in
        the [<span class="api_gateway_variablesgateway">API
        Gateway</span> OAuth User
        Guide](/bundle/APIGateway_77_OAuthUserGuide_allOS_en_HTML5/)
    *  [Configure API Manager Cassandra client
        settings](#APIMngrClient)

3.  Select **Environment Configuration \> Key Property Stores \> API
    Server \> Data Sources \> Cassandra Storage**, and click **Edit**.

4.  In the **Read Consistency Level** and **Write Consistency Level**
    fields, select **QUORUM**:

    {% include image.html file="cassandra/api_mgmt_embedded_kps.png" %}

5.  Repeat this step for each KPS collection using Cassandra (for
    example, **Key Property Stores \> OAuth**, or
    **<span class="suite_variablesAPIPortalName">API Portal</span>** for
    <span class="api_gateway_variablesapi_mgr">API Manager</span>). This
    also applies to any custom KPS collections that you have created.
6.  If you are using OAuth and Cassandra, you must also configure quorum
    consistency for all OAuth2 stores under **Libraries \> OAuth2
    Stores**:
      - **Access Token Stores \> OAuth Access Token Store**
      - **Authorization Code Stores \> Authz Code Store**
      - **Client Access Token Stores \> OAuth Client Access Token
        Store**

|  | <span>**Note  **</span> | By default, OAuth uses EhCache instead of Cassandra. For more details on OAuth, see the [<span class="api_gateway_variablesgateway">API Gateway</span> OAuth User Guide](/bundle/APIGateway_77_OAuthUserGuide_allOS_en_HTML5/). |

#### Deploy the configuration

1.  Click **Deploy** in the toolbar to deploy this configuration to the
    <span class="api_gateway_variablesgateway">API Gateway</span> group.
2.  Restart each <span class="api_gateway_variablesgateway">API
    Gateway</span> in the group.

For details on any connection errors between
<span class="api_gateway_variablesgateway">API Gateway</span> and
Cassandra, see [Configure a highly available Cassandra cluster](#top).

### <span id="APIMngrClient"></span>Configure <span class="api_gateway_variablesapi_mgr">API Manager</span> Cassandra client settings

To update the Cassandra client configuration for
<span class="api_gateway_variablesapi_mgr">API Manager</span>, perform
the following steps:

1.  Ensure the <span class="api_gateway_variablesgateway">API
    Gateway</span> and <span class="api_gateway_variablesapi_mgr">API
    Manager</span> components have been installed on the
    <span class="api_gateway_variablesgateway">API Gateway</span> 1 and
    <span class="api_gateway_variablesgateway">API Gateway</span> 2
    nodes. These can be local or remote to Cassandra installations. For
    details, see the [<span class="api_gateway_variablesgateway">API
    Gateway</span> Installation
    Guide](/bundle/APIGateway_77_InstallationGuide_allOS_en_HTML5/).
2.  Ensure an <span class="api_gateway_variablesgateway">API
    Gateway</span> domain, group, and instance have been created on the
    <span class="api_gateway_variablesgateway">API Gateway</span> 1 node
    using `managedomain`. For more details, see [Configure an
    <span class="api_gateway_variablesgateway">API Gateway</span>
    domain](/csh?context=102&product=prod-api-gateway-77) in the
    [<span class="api_gateway_variablesgateway">API Gateway</span>
    Administrator
    Guide](/bundle/APIGateway_77_AdministratorGuide_allOS_en_HTML5/).

<!-- end list -->

1.  Start the first <span class="api_gateway_variablesgateway">API
    Gateway</span> instance in the group. For example:
    ```console
    startinstance -n "my_gw_server_1" -g "my_group"
    ````
2.  Configure the Cassandra connection on the
    <span class="api_gateway_variablesgateway">API Gateway</span> 1
    node. For details, see [Configure the API Gateway Cassandra client
    connection](#Configur6).

<!-- end list -->

1.  Configure the Cassandra consistency levels for your KPS Collections.
    For details, see [Configure the API Gateway Cassandra consistency
    levels](#Configur7).
2.  In the <span class="suite_variablesPolicyStudioName">Policy
    Studio</span> tree, select **Server Settings** \> **API Manager** \>
    **Quota Settings**, and ensure that **Use Cassandra** is selected.
3.  Under **Cassandra consistency levels**, in both the **Read** and
    **Write** fields, select `QUORUM`:
    {% include image.html file="cassandra/api_mgmt_quota_settings.png" %}    

4.  Add the <span class="api_gateway_variablesgateway">API
    Gateway</span> 2 host machine to the domain using `managedomain`.
5.  Create the second <span class="api_gateway_variablesgateway">API
    Gateway</span> instance in the same group on the
    <span class="api_gateway_variablesgateway">API Gateway</span> 2
    node.

|  | <span>**Note  **</span> | Do not start this instance, and do not configure <span class="api_gateway_variablesapi_mgr">API Manager</span> for this instance in <span class="api_gateway_variablespolicy_studio">Policy Studio</span>. |

4.  Before starting the second
    <span class="api_gateway_variablesapi_mgr">API
    Manager</span>-enabled instance, ensure that each instance has
    unique ports in the `envSettings.props` file. For example:

    1.  Edit the `envSettings.props` file for the
        <span class="api_gateway_variablesgateway">API Gateway</span>
        instance in the following directory:
        ```console
        INSTALL_DIR/apigateway/groups/<group-n>/<instance-m>/conf/envSettings.props
        ````
    2.  Add the <span class="api_gateway_variablesapi_mgr">API
        Manager</span> ports. For example, the defaults are:

```console
#API Manager Port
env.PORT.APIPORTAL=8075

#API Manager Traffic Port
env.PORT.PORTAL.TRAFFIC=8065
````



1.  Start the second <span class="api_gateway_variablesgateway">API
    Gateway</span> instance. For example:
    ```console
    startinstance -n "my_gw_server_2" -g "my_group"
    ````
2.  On startup, this instance receives the
    <span class="api_gateway_variablesapi_mgr">API Manager</span>
    configuration for the group. It now shares the same KPS and
    Cassandra configuration and data, and uses the ports specified in
    the `envSettings.props` file.

{% include links.html %}
