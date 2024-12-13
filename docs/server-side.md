# Node-RED server side

```sh{2}
├── src
│   └── red-server.ts # this file
```

## Usage

You can interact with the Node-RED backend using the `src/red-server.ts` file.

For example if you want to add server endpoints, you can do it in this file, by exporting a default function.

```typescript
import { runAnything } from './common/tools/my-custom-helper.ts'


export default function () {

  RED.httpNode.post('/my_endpoint', async (req, res) => {
    // Your code here
    await runAnything();
  });
  
  // another stuff
}
```
::: tip 💡
Feel free to import any package you need in this file. You can structure your code as you want.
:::
