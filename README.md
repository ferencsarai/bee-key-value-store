# Bee key-value store example

## run

### npm install

```bash
npm install
```

### example

```bash
ts-node src/index.sh
```

## starting Bee in devcontainer.json

__devcontainer.json:__

```bash
"postStartCommand": "./start.sh"
```

__start.sh:__ 
- npm install
- It starts the Bee in dev mode with cors=*; the Bee output is in the nohup.out file
- Purchases a  stamp
- Add the stamp value to the STAMP environment variable, which the index.ts file loads.
- Starts the index.ts

```bash
npm install
nohup bash -c 'bee dev --cors-allowed-origins="*" &'
sleep 3
STAMP=$(swarm-cli stamp buy --yes --depth 20 --amount 10000000 | grep "Stamp ID:" | cut -d " " -f 3)
echo $STAMP
export STAMP
echo "export STAMP='$STAMP'" >> ~/.bashrc
ts-node src/index.ts
```