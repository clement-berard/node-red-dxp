# Pug Template

## Overview

We've implemented a templating system using [Pug](https://pugjs.org/api/getting-started.html) 🎨, an expressive and concise HTML template engine.

Reusable components are available to simplify DOM management. 

You also benefit from Pug's import system (mixins, includes, extends) to structure and organize your code in a modular and maintainable way. 📦
```sh{5}
├── src/
│   ├── nodes/ # Your nodes
│   │   ├── my-node-1/
│   │   │   ├── editor/ # Your node editor folder
│   │   │   │   └── index.pug # Your node editor Pug (mandatory)
└── package.json
```

## Usage

You need to import relative link to our helper: 

```jade
// adapt to the `.node-red-dxp` at the root of your project
include ../../../../.node-red-dxp/pug/helper
```

💡 See all components [here](https://github.com/clement-berard/node-red-dxp/blob/main/src/editor/assets/pug/helper.pug)

## Available components

| Component                        | Description                                   |
|----------------------------------|-----------------------------------------------|
| `+dxpFormRowInputText`           | Input text (or other text type like password) |
| `+dxpFormRowSelect`              | Input Select                                  |
| `+dxpFormRowCheckbox`            | Input Checkbox                                |
| `+dxpFormRowEditableList`        | Label + list host for `initEditableList`      |
| `+dxpFormRowSelectConfigNode`    | Select for a config node                      |
| `+dxpHint`                       | Hint container                                |
| `+simpleButton`                  | Simple button                                 |
| `+dxpTabs`                       | Native node-red tabs                          |
| `+iconFontAwesome`               | Add font-awesome icon                         |

### Main Properties

- Use `isConfig: true` in every component to include in config node

## Examples

:::tabs
== index-config-node.pug
```jade
include ../../../../.node-red-dxp/pug/helper

+dxpFormRowInputText({ id: 'name', label: 'Name', icon: 'tag', isConfig: true })

+dxpFormRowInputText({
    id: 'ip',
    isConfig: true,
    label: 'TV IP',
    icon: 'link',
    placeholder: '192.168.1.22',
})

+dxpFormRowInputText({
    id: 'url',
    label: 'API Url',
    icon: 'link',
    isConfig: true
})(readonly)
    +dxpHint({ icon: 'info-circle', fullWidth: true })
        |  Port
        span.font-bold.ml-1 1926
        |  and version
        span.font-bold.ml-1 6
        |  is automatically added to the API Url.


.alert.alert-info.text-center
    p If you already have credentials, you can fill in the following fields
    p Otherwise, you can try to pair the TV below.

+dxpFormRowInputText({
    id: 'digest_user',
    label: 'Digest User',
    icon: 'user',
    placeholder: 'Digest user name',
    isConfig: true
})

+dxpFormRowInputText({
    id: 'digest_password',
    label: 'digest Password',
    icon: 'lock',
    placeholder: 'Digest password',
    isConfig: true,
})(type="password")

#pairing-section.form-row.text-center.hidden
    +simpleButton({ id: 'trigger-action-start-pairing', text: 'Start Pairing' })
    #pairing-ready.hidden
        .alert.alert-success
            p Your TV is ready to pair. 🎉
            p Please enter the pin code displayed on your TV.
        div
            input#pairing-pin-input(type="text" class="text-center !w-[30%] !mb-3")
        #invalid-pin.hidden.text-red-800.my-1
            | Pin must be 4 digits.
        +simpleButton({ id: 'trigger-action-complete-pairing', text: 'Complete Pairing' })
        #paring-success.hidden.alert.alert-success
            | Your TV is successfully paired. 🎉
```
== index-regular-node.pug
```jade
include ../../../common/editor/templates/common-head-fields

+dxpFormRowInputText({ id: 'name', label: 'Name', icon: 'tag' })
+dxpFormRowSelect({ id: "action", label: "Action", icon: 'bolt' })
+dxpFormRowSelect({ id: "value", label: "Value", icon: 'cube' })
+dxpFormRowCheckbox({
    id: "returnInfo",
    label: "return info",
    icon: 'table',
    text: 'Return ambilight information after operation'
})
```
:::
