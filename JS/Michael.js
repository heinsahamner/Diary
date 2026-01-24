const BillieJeanTimeline = [
  { time: "00:30.10", text: "She was more like a beauty queen from a movie scene" },
  { time: "00:34.40", text: "I said don't mind, but what do you mean I am the one" },
  { time: "00:38.90", text: "Who will dance on the floor in the round" },
  { time: "00:44.20", text: "She said I am the one who will dance on the floor in the round" },
  { time: "00:54.90", text: "She told me her name was Billie Jean, as she caused a scene" },
  { time: "00:58.90", text: "Then every head turned with eyes that dreamed of being the one" },
  { time: "01:04.40", text: "Who will dance on the floor in the round" },
  { time: "01:10.80", text: "People always told me be careful of what you do" },
  { time: "01:14.80", text: "And don't go around breaking young girls' hearts" },
  { time: "01:19.20", text: "And mother always told me be careful of who you love" },
  { time: "01:22.80", text: "And be careful of what you do 'cause the lie becomes the truth" },
  { time: "01:27.50", text: "Billie Jean is not my lover" },
  { time: "01:31.50", text: "She's just a girl who claims that I am the one" },
  { time: "01:37.20", text: "But the kid is not my son" },
  { time: "01:42.20", text: "She says I am the one, but the kid is not my son" },
  { time: "01:52.40", text: "For forty days and forty nights" },
  { time: "01:55.30", text: "The law was on her side" },
  { time: "01:56.30", text: "But who can stand when she's in demand" },
  { time: "01:59.40", text: "Her schemes and plans" },
  { time: "02:01.20", text: "'Cause we danced on the floor in the round" },
  { time: "02:06.40", text: "So take my strong advice, just remember to always think twice" },
  { time: "02:14.40", text: "(do think twice.)" },
  { time: "02:17.10", text: "She told my baby we'd danced 'til three" },
  { time: "02:19.80", text: "Then she looked at me" },
  { time: "02:21.20", text: "She showed a photo of a baby crying" },
  { time: "02:23.70", text: "His eyes looked like mine" },
  { time: "02:25.70", text: "Go on dance on the floor in the round, baby" },
  { time: "02:33.10", text: "People always told me be careful of what you do" },
  { time: "02:37.00", text: "And don't go around breaking young girls' hearts" },
  { time: "02:40.40", text: "She came and stood right by me" },
  { time: "02:43.20", text: "Then the smell of sweet perfume" },
  { time: "02:45.30", text: "This happened much too soon" },
  { time: "02:47.00", text: "She called me to her room" },
  { time: "02:49.50", text: "Billie Jean is not my lover" },
  { time: "02:54.00", text: "She's just a girl who claims that I am the one" },
  { time: "02:58.30", text: "But the kid is not my son" },
  { time: "03:07.00", text: "Billie Jean is not my lover" },
  { time: "03:10.10", text: "She's just a girl who claims that I am the one" },
  { time: "03:15.10", text: "But the kid is not my son" },
  { time: "03:20.90", text: "She says I am the one, but the kid is not my son" },
  { time: "03:45.90", text: "She says I am the one, but the kid is not my son" },
  { time: "03:56.10", text: "Billie Jean is not my lover" },
  { time: "03:59.80", text: "She's just a girl who claims that I am the one" },
  { time: "04:04.10", text: "But the kid is not my son" },
  { time: "04:10.50", text: "She says I am the one, but the kid is not my son" },
  { time: "04:18.50", text: "She says I am the one, she says he is my son" },
  { time: "04:26.60", text: "She says I am the one" },
  { time: "04:29.20", text: "Billie Jean is not my lover" },
  { time: "04:32.70", text: "Billie Jean is not my lover" },
  { time: "04:36.80", text: "Billie Jean is not my lover" },
  { time: "04:40.90", text: "Billie Jean is not my lover" },
  { time: "04:45.00", text: "Billie Jean is not my lover" },
  { time: "04:49.10", text: "Billie Jean is not my lover" }
];

function timeToMs(time) {
  const [min, rest] = time.split(":");
  const [sec, ms] = rest.split(".");
  return (Number(min) * 60 + Number(sec)) * 1000 + Number(ms) * 10;
}

function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function showTimeMJ() {
  console.log("♫ Billie Jean começa ♫");

  let lastTime = 0;

  for (const verse of BillieJeanTimeline) {
    const currentTime = timeToMs(verse.time);
    const delay = currentTime - lastTime;

    await esperar(delay);
    console.log(verse.text);

    lastTime = currentTime;
  }

  console.log("♫ Billie Jean termina ♫");
}

showTimeMJ();