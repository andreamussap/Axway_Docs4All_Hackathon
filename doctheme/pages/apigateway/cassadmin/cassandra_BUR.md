---
title: Backup and restore
keywords: sample
summary: "This is just a sample topic..."
sidebar: apig_sidebar
permalink: cassandra_BUR.html
folder: apigateway
---

# <span class="api_gateway_variablescassandra">Apache Cassandra</span> backup and restore

In an <span class="api_gateway_variablescassandra">Apache
Cassandra</span> database cluster, data is replicated between multiple
nodes and potentially between multiple datacenters. Cassandra is highly
fault-tolerant, and depending on the size of the cluster, it can survive
the failure of one or more nodes without any interruption in service.
However, backups are still needed to recover from the following
scenarios:

  - Any errors made in data by client applications
  - Accidental deletions
  - Catastrophic failure that requires a rebuild of the entire cluster
  - Rollback of the cluster to a known good state in the event of data
    corruption

This topic describes which
<span class="api_gateway_variablescassandra">Apache Cassandra</span>
data keyspaces to back up, and explains how to use scripts to create and
restore the data in those keyspaces. It also describes which
<span class="api_gateway_variablescassandra">Apache Cassandra</span>
configuration and <span class="api_gateway_variablesgateway">API
Gateway</span> configuration to back up.

## Before you begin

| <span>**Caution  **</span> | You must read all of the following before you perform any of the instructions in this topic: |

  - These instructions apply only to an
    <span class="api_gateway_variablescassandra">Apache Cassandra</span>
    cluster where the replication factor is the same as the cluster
    size, which means that each node contains 100% of the data. This is
    the standard configuration for
    <span class="axway_variablesCompany Name">Axway</span>
    <span class="api_management_variablesAPIManagementName">API
    Management</span> processes, and these instructions are intended to
    back up <span class="api_management_variablesAPIManagementName">API
    Management</span> keyspaces only.
  - Because 100% of the data is stored on each node, you will run the
    backup procedure on a single node only, preferably on the seed node.
  - The following instructions and scripts are intended as a starting
    point and must be customized and automated as needed to match your
    backup polices and environment.
  - These instructions use the Cassandra snapshot functionality. A
    *snapshot* is a set of hard links for the current data files in a
    keyspace.  

<table>
<tbody>
<tr class="odd">
<td></td>
<td><span><strong>Note  </strong></span></td>
<td>While the snapshot does not take up noticeable diskspace, it will cause stale data files not to be cleaned up. This is because a snapshot directory is created under each table directory and will contain hard links to all table data files.<br />
When Cassandra cleans up the stale table data files, the snapshot files will remain. Therefore, it is critical to remove them promptly. The example backup script takes care of this by deleting the snapshot files at the end of the backup.</td>
</tr>
</tbody>
</table>

  - For safety reasons, the backup location should *not* be on the same
    disk as the Cassandra data directory, and it also must have enough
    free space to contain the keyspace.

## Which data keyspaces to back up?

These procedures apply to data in
<span class="api_management_variablesAPIManagementName">API
Management</span> and KPS keyspaces only. You must first obtain a list
of the keyspace names to back up.
<span class="api_management_variablesAPIManagementName">API
Management</span> keyspaces may have a custom name defined, but are
named in the format of `<UUID>_group_[n]` by default. For example:

<table>
<tbody>
<tr class="odd">
<td>
`x9fa003e2_d975_4a4a_a27e_280ab7fd8a5_group_2p_2`
</td>
</tr>
</tbody>
</table>


|  | <span>**Note  **</span> | All Cassandra internal keyspaces begin with `system`, and should not be backed up using this process. |

You can do this using `cqlsh` or `kpsadmin` commands:

### Find keyspaces using cqlsh

Using `cqlsh`, execute the following command:

<table>
<tbody>
<tr class="odd">
<td>`SELECT * from system.schema_keyspaces;`</td>
</tr>
</tbody>
</table>

In the following example, `xxx_group_2` and `xxx_group_3` are
<span class="api_management_variablesAPIManagementName">API
Management</span> keyspaces:

{% include image.html file="cassandra/cqlsh_keyspace.png" %}

### Find keyspaces using kpsadmin

Using `kpsadmin`, choose: `option 30) Show Configuration`, and enter the
<span class="api_gateway_variablesgateway">API Gateway</span> group and
any instance to back up, or use the command line, as shown in the
following example:

{% include image.html file="cassandra/kpsadmin_keyspace.png" %}

## Back up a keyspace

To back up a keyspace, you will use the `nodetool snapshot` command to
create hard links, run a custom script to back up these links, and then
archive that backup.

|  | <span>**Note  **</span> | You must repeat these steps for each keyspace to back up. |

1.  Create a snapshot by running the following command on the seed node:

<table>
<tbody>
<tr class="odd">
<td>
`nodetool CONNECTION_PARMS snapshot -t SNAPSHOT_NAME-TIMESTAMP API_GW_KEYSPACE_NAME`
</td>
</tr>
</tbody>
</table>

1.  For example: 

{% include image.html file="cassandra/nodetool_snapshot.png" %}

2.  Run the following script to copy the snapshot files to another
    location: 

|  | <span>**Note  **</span> | This script also clears the snapshot files from the Cassandra `data` directory. |

```bash
#!/bin/bash
################################################################################
# Sample Cassandra snapshot backup script                                      #
# NOTE: This MUST be adapted for and validated in your environment before use! #
################################################################################
set -e
trap '[ "$?" -eq 0 ] || echo \*\*\* FATAL ERROR \*\*\*' EXIT $?
# Replace the xxx values below to match your environment
CASSANDRA_DATA_DIR="xxx"
KEYSPACE_NAME="xxx"
SNAPSHOT_NAME="xxx"
BACKUP_ROOT_DIR="xxx"
# Example:
#  CASSANDRA_DATA_DIR="/opt/cassandra/data/data"
#  KEYSPACE_NAME="x9fa003e2_d975_4a4a_a27e_280ab7fd8a5_group_2"
#  SNAPSHOT_NAME="Group2-20181127_2144_28"
#  BACKUP_ROOT_DIR="/backup/cassandra-snapshots"
##### Do NOT change anything below this line #####
backupdir="${BACKUP_ROOT_DIR}/${SNAPSHOT_NAME}"
if [ -d "${backupdir}" ]; then echo -e "\nERROR: Snapshot '${SNAPSHOT_NAME}' already exists in the backup dir";exit 1; fi
mkdir -p ${backupdir}
keyspace_path="${CASSANDRA_DATA_DIR}/${KEYSPACE_NAME}"
if ! [ -d "${keyspace_path}" ]; then echo -e "\nERROR: Keyspace path '${keyspace_path}' is not valid";exit 1; fi
snapshot_dirs=()
find "${keyspace_path}/" -maxdepth 1 -mindepth 1 -type d ! -name "$(printf "*\n*")" > backup.tmp
while IFS= read -r table_dir
do
  str=${table_dir##*/}
  table_uuid=${str##*-}
  len=$((${#str} - ${#table_uuid} - 1))
  table_name=${str:0:${len}}
  echo "Copy table, $table_name"
  current_backup_dir="${backupdir}/${table_name}"
  mkdir -p "${current_backup_dir}"
  current_snapshot="${table_dir}/snapshots/${SNAPSHOT_NAME}"
  snapshot_dirs+=("${current_snapshot}")
  cp -r -a "${current_snapshot}"/* "${current_backup_dir}/"
done < backup.tmp
rm backup.tmp
echo -e "\nRemoving snapshot files from Cassandra data directory"
for dir in "${snapshot_dirs[@]}"
do
  rm -rf "${dir}"
done
````


When this script finishes, it creates the following backup directory
structure:

<table>
<tbody>
<tr class="odd">
<td>
<code>&lt;BACKUP_ROOT_DIR&gt;
├── &lt;SNAPSHOT_NAME&gt;
│ ├── &lt;TABLE_NAME&gt;
│ │  ├── &lt;SNAPSHOT_FILES&gt;
│ ├── &lt;TABLE_NAME&gt;
│ │  ├── &lt;SNAPSHOT FILES&gt;
│ │...</code></td>
</tr>
</tbody>
</table>

1.  Archive the `SNAPSHOT_NAME` directory using your company's archive
    method so you can restore it later if needed.


|  | <span>**Note  **</span> | It is best to take a snapshot backup on a daily basis. |

## Restore a keyspace

This section explains how to restore
<span class="api_management_variablesAPIManagementName">API
Management</span> and KPS keyspaces and provides an example script to
restore the files.

### Before you begin


|  | <span>**Note  **</span> | If you are restoring a keyspace to the same cluster that the backup was taken from, skip to [Steps to restore a keyspace](#Restore). |

Before you restore a keyspace in a new Cassandra cluster, you must
ensure the following:

  - The Cassandra cluster must be created to the
    <span class="api_gateway_variablesgateway">API Gateway</span> HA
    specifications. For more details, see [Configure a highly available
    Cassandra cluster](cassandra_config).
  - All <span class="api_gateway_variablesgateway">API Gateway</span>
    groups must have their schema created in the new cluster, and the
    replication factor must be the same as the cluster size (normally
    3).
  - If the keyspace name has changed in the new cluster, use the new
    name in the `KEYSPACE_NAME` variable in the restore script.

### <span id="Restore"></span>Steps to restore a keyspace

1.  Shut down all <span class="api_gateway_variablesgateway">API
    Gateway</span> instances and any other clients in the Cassandra
    cluster.
2.  Drain and shut down each Cassandra node in the cluster, one node at
    a time.


|  | <span>**Note  **</span> | You must execute the following (and wait for it to complete) on each Cassandra node before shutting it down, otherwise data loss may occur: |

<table>
<tbody>
<tr class="odd">
<td>`nodetool CONNECTION_PARMS drain`</td>
</tr>
</tbody>
</table>

1.  On the Cassandra seed node, delete all files in the `commitlog` and
    `saved_caches` directory. For example:

<table>
<tbody>
<tr class="odd">
<td>`rm -r /opt/cassandra/data/commitlog/* /opt/cassandra/data/saved_caches/*`</td>
</tr>
</tbody>
</table>


|  | <span>**Note  **</span> | Do not delete any folders in the keyspace folder on the node being restored. The restore script requires the table directories to be present in order to function correctly. |

1.  On the Cassandra seed node, run the following script to restore the
    snapshot files taken by the backup process and script (described in
    [Back up a keyspace](#Back)):

```bash
#!/bin/bash
################################################################################
# Sample Cassandra restore snapshot script                                     #
# NOTE: This MUST be adapted for and validated in your environment before use! #
################################################################################
# Replace the xxx values below to match your environment
CASSANDRA_DATA_DIR="xxx"
KEYSPACE_NAME="xxx"
SNAPSHOT_NAME="xxx"
BACKUP_ROOT_DIR="xxx"
# Example:
#  CASSANDRA_DATA_DIR="/opt/cassandra/data/data"
#  KEYSPACE_NAME="x9fa003e2_d975_4a4a_a27e_280ab7fd8a5_group_2"
#  SNAPSHOT_NAME="Group2-20181127_2144_28"
#  BACKUP_ROOT_DIR="/backup/cassandra-snapshots"
##### Do NOT change anything below this line #####
backupdir="${BACKUP_ROOT_DIR}/${SNAPSHOT_NAME}"
keyspace_path="${CASSANDRA_DATA_DIR}/${KEYSPACE_NAME}"
echo -e "\n\tRestoring tables from directory, '${backupdir}', to directory, '${keyspace_path}'"
echo -e "\tRestore snapshot, '${SNAPSHOT_NAME}', to keyspace, '${KEYSPACE_NAME}'"
read -n 1 -p "Continue (y/n)?" answer
echo -e "\n"
if [ "$answer" != "y" ] && [ "$answer" != "Y" ]; then
  exit 1
fi
set -e
trap '[ "$?" -eq 0 ] || echo \*\*\* FATAL ERROR \*\*\*' EXIT $?
if ! [ -d "${backupdir}" ]; then echo -e "\nERROR: Backup not found at '${backupdir}'";exit 1; fi
if ! [ -d "${keyspace_path}" ]; then echo -e "\nERROR: Keyspace path '${keyspace_path}' is not valid";exit 1; fi
keyspace_tables=$(mktemp)
find "${keyspace_path}/" -maxdepth 1 -mindepth 1 -type d -fprintf ${keyspace_tables} "%f\n"
sort -o ${keyspace_tables} ${keyspace_tables}
backup_tablenames=$(mktemp)
find "${backupdir}/" -maxdepth 1 -mindepth 1 -type d -fprintf ${backup_tablenames} "%f\n"
sort -o ${backup_tablenames} ${backup_tablenames}
keyspace_tablenames=$(mktemp)
table_names=()
table_uuids=()
while IFS= read -r table
do
  str=${table##*/}
  uuid=${str##*-}
  len=$((${#str} - ${#uuid} - 1))
  name=${str:0:${len}}
  echo "${name}" >> ${keyspace_tablenames}
  table_names+=(${name})
  table_uuids+=(${uuid})
done < ${keyspace_tables}
set +e
diff -a -q ${keyspace_tablenames} ${backup_tablenames}
if [ $? -ne 0 ]; then
  echo -e "\nERROR: The tables on the keyspace at, '${keyspace_path}', are not the same as the ones from the backup at,
'${backupdir}'"
  exit 1
fi
for ((i=0; i<${#table_names[*]}; i++));
do
  echo "Restoring table, '${table_names[i]}'"
  table_dir="${keyspace_path}/${table_names[i]}-${table_uuids[i]}"
  rm -r "${table_dir}"
  mkdir "${table_dir}"
  src="${backupdir}/${table_names[i]}"
  cp -r -a "${src}"/* "${table_dir}/"
done
````

1.  On the other nodes in the cluster, perform the following:

2.    - Delete all files in the `commitlog` and `saved_caches`
        directory.
      - Delete all files in the `KEYSPACE` being restored under the
        `CASSANDRA_DATA_DIRECTORY`. For example:

<table>
<tbody>
<tr class="odd">
<td><code>rm -rf /opt/cassandra/data/data/x9fa003e2_d975_4a4a_a27e_280ab7fd8a5_group_2/*
</code></td>
</tr>
</tbody>
</table>

6.  If you have other keyspaces to restore, return to step 4 and repeat.
    Otherwise, continue to the next steps.
7.  One at a time, start the Cassandra seed node, and then the other
    nodes, and wait for each to be in Up/Normal (`UN`) state in
    `nodetool status` before you proceed to the next node.
8.  Perform a full repair of the cluster as follows on each node one at
    a time:  

<table>
<tbody>
<tr class="odd">
<td><code>nodetool repair -pr --full</code></td>
</tr>
</tbody>
</table>

6.  Start the <span class="api_gateway_variablesgateway">API
    Gateway</span> instances.

## Which configuration to back up?

In addition to backing up your data in
<span class="api_gateway_variablescassandra">Apache Cassandra</span>
keyspaces, you must also back up your
<span class="api_gateway_variablescassandra">Apache Cassandra</span>
configuration and <span class="api_gateway_variablesgateway">API
Gateway</span> configuration.

### <span class="api_gateway_variablescassandra">Apache Cassandra</span> configuration

You must back up the `CASSANDRA_HOME/conf` directory on all nodes.

### <span class="api_gateway_variablesgateway">API Gateway</span> group configuration

You must back up the <span class="api_gateway_variablesgateway">API
Gateway</span> group configuration in the following directory:

<table>
<tbody>
<tr class="odd">
<td><code>API_GW_INSTALL_DIR/apigateway/groups/&lt;group-name&gt;/conf</code></td>
</tr>
</tbody>
</table>

This directory contains
the <span class="api_gateway_variablesgateway">API
Gateway</span>, <span class="api_gateway_variablesapi_mgr">API
Manager</span>, and KPS configuration data.

{% include links.html %}
