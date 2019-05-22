---
layout: document
title: 'Never ending story of Axway '
date: 2019-05-16T12:26:50.852Z
---
1. Once upon a time there was an old woman who lived in a shoe

## (now you continue the story :) )

2. But she wanted to go out and see the world so, one day she took a chance and jumped onto the chainamail of a young knight who was passing by.



## Arbitrary code block test

```
<routes xmlns:u="http://www.systar.com/aluminium/camel-util" xmlns="http://camel.apache.org/schema/spring">
```

```
    <route>
```

```
        <from uri="timer://config?repeatCount=1" />
```

```
 
```

```
        <!-- Initial header value -->
```

```
        <setHeader headerName="temp">
```

```
            <constant>4</constant>       
```

```
        </setHeader>
```

```
        <!-- Init the aggregator, for example with a value from a previous run. The aggregator will read the configured header for its initial value. -->
```

```
        <to uri="bean:maxagg?method=init"/>
```

```
 
```

```
        <!-- Initial hardcoded body, to be split -->
```

```
        <setBody>
```

```
            <simple>1, 5, 3</simple>
```

```
        </setBody>
```

```
        <to uri="log:maxagg.test?level=WARN"/>
```

```
         
```

```
        <!-- Split the body, specifying the 'maxagg' aggregation strategy -->
```

```
        <split strategyRef="maxagg">
```

```
            <tokenize token=","/>
```

```
            <!-- Set split result into 'temp' header -->
```

```
            <setHeader headerName="temp">
```

```
                <simple>body</simple>       
```

```
            </setHeader>
```

```
        </split>
```

```
         
```

```
        <!-- Log the header from the split aggregator -->
```

```
        <setBody>
```

```
            <simple>header.temp</simple>
```

```
        </setBody>
```

```
        <to uri="log:maxagg.test?level=WARN"/>
```

```
   </route>
```

```
</routes>
```
