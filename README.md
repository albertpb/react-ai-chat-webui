# WIP

This is a web interface for [Oobabooga text generation webui](https://github.com/oobabooga/text-generation-webui)
built with NextJs, Tailwind and DaisyUI

## Getting Started

Install packages:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Or build and run

```bash
npm run build
npm run start
```

---

In Oobabooga to able to get the characters, You need to download and replace [blocking_api.py](https://gist.github.com/albertpb/e393cffe17e42e37bc007a99f9175ab5) into text-generation-webui\extensions\api.

Start Oobabooga with --api

---

![example](preview.png)

## TODO

- Implement text streaming
- Add select to change interface modes
- Add form to change settings
- Add LateX rendering
