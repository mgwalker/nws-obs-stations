import fs from "node:fs/promises";

const sleep = async (ms) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });

const stations = [];

const getStations = async (url = "https://api.weather.gov/stations") => {
  const data = await fetch(url).then((response) => response.json());
  const obs = data.observationStations;
  const next = data.pagination.next;

  stations.push(obs);
  console.log(`Page ${stations.length}`);

  if (Array.isArray(obs) && obs.length > 0 && next) {
    await sleep(3_000);
    return getStations(next);
  }
};

const getAllStations = async () => {
  await getStations();

  await fs.writeFile("list.json", JSON.stringify(stations.flat(), null, 2));
  console.log("done");
};

const main = async () => {
  // await getAllStations();

  const fullList = JSON.parse(await fs.readFile("list.json"));
  const stations = JSON.parse(await fs.readFile("docs/stations.json"));

  const existingIds = new Set(stations.map(({ id }) => id));
  const list = fullList.filter((id) => !existingIds.has(id));

  for (let i = 0; i < list.length; i += 1) {
    const id = list[i];
    process.stdout.write(`\r${i + 1 + existingIds.size} of ${fullList.length}`);

    const data = await fetch(id).then((response) => response.json());
    if (data.status !== 404) {
      stations.push({
        id,
        name: data.properties.name,
        geo: {
          lat: data.geometry.coordinates[1],
          lon: data.geometry.coordinates[0],
          elevation: {
            feet: data.properties.elevation.value * 3.28,
            meters: data.properties.elevation.value,
          },
        },
      });

      await fs.writeFile(
        "docs/stations.json",
        JSON.stringify(stations, null, 2),
      );
    } else {
      console.log(`\n404: ${id}`);
    }
    await sleep(100);
  }
};

main();
