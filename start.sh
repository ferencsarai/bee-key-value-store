npm install
nohup bash -c 'bee dev --cors-allowed-origins="*" &'
sleep 3
STAMP=$(swarm-cli stamp buy --yes --depth 20 --amount 10000000 | grep "Stamp ID:" | cut -d " " -f 3)
echo $STAMP
export STAMP
echo "export STAMP='$STAMP'" >> ~/.bashrc
ts-node src/index.ts
