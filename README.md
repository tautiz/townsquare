# Hogwartso mūšis - Grimuaras ir Miestelio aikštė

> :warning: **Šis projektas yra paremtas [Blood on the Clocktower](https://clocktower.online) žaidimu ir pritaikytas Harry Potter tematikai.** :warning:

Tai neoficialus internetinis įrankis, skirtas vesti „Hogwartso mūšis" (Blood on the Clocktower) žaidimus per Discord ar kitas skaitmenines priemones.
Jis padeda pasakotojams ir žaidėjams greitai paruošti žaidimus, vesti balsavimus ir daug daugiau.

## Funkcijos

- **Vieša Miestelio aikštė** ir **Pasakotojo Grimuaras** (perjungti su **sparčiuoju klavišu \[G\]**)
- Palaiko pasirinktinius scenarijus JSON formatu, sugeneruotus [Script Tool](https://bloodontheclocktower.com/script)
- **Gyva sesija** pasakotojui ir žaidėjams, įskaitant gyvą balsavimą ir veikėjų paskirstymą!
- Apima visas 3 bazines edicijas, Keliautojus ir Legendinius veikėjus bei visus oficialiai atskleistus veikėjus!
- **Nakties lapas** ir priminimo tekstas kiekvienam veikėjo gebėjimui, padedantis pasakotojams
- Pilnas namų taisyklių palaikymas žaidimams su savo veikėjų rinkiniais
- Daug kitų pritaikymo galimybių!

## Sparčiųjų klavišų sąrašas

| Klavišas | Funkcija |
|----------|----------|
| **G** | Perjungti Grimuarą (viešas/privatus) |
| **N** | Atidaryti Nakties tvarkos lapą |
| **R** | Atidaryti Veikėjų nuorodų lapą |
| **E** | Atidaryti Edicijos pasirinkimą |
| **Space** | Perjungti Naktį/Dieną |

## Pasirinktinio scenarijaus palaikymas

Bet koks pasirinktinis scenarijus, sugeneruotas oficialiu [Script Tool](https://script.bloodontheclocktower.com/), yra palaikomas iš karto - jums tereikia jį įkelti, kad gautumėte pasirinktą veikėjų rinkinį į savo Grimuarą. Jei norite toliau pritaikyti savo scenarijų, yra papildomas `"_meta"` objektas, kurį galite pridėti prie scenarijaus kaip įprastą veikėją:

```json
[
  {
    "id": "_meta",
    "name": "Hogwartso mūšis",
    "author": "Jūsų vardas",
    "logo": "https://url.to/your/logo.png"
  }
]
```

Tai suteiks jūsų vietiniam Grimuarui (ir jūsų gyvos sesijos žaidėjų Grimuarams) daugiau informacijos apie jūsų pasirinktinį scenarijų - vietoj „Custom Script" bus rodoma „Hogwartso mūšis" veikėjų nuorodų lape.

## Pasirinktinio veikėjo palaikymas

Norėdami pridėti pasirinktinius veikėjus į savo vietinį Grimuarą, turite sukurti JSON apibrėžimą jiems, panašų į tai, kas pateikta [`roles.json`](https://github.com/bra1n/townsquare/blob/main/src/roles.json) faile 3 bazinėms edicijoms. Štai pavyzdys, kaip toks veikėjo apibrėžimo failas gali būti parašytas:

```json
[
  {
    "id": "akrobatas",
    "image": "https://example.com/akrobatas.png",
    "edition": "custom",
    "firstNight": 0,
    "firstNightReminder": "",
    "otherNight": 49,
    "otherNightReminder": "Jei kuris nors geras gyvas kaimynas yra girtas arba apnuodytas, Akrobatas miršta.",
    "reminders": ["Miršta"],
    "remindersGlobal": [],
    "setup": false,
    "name": "Akrobatas",
    "team": "outsider",
    "ability": "Kiekvieną naktį*, jei kuris nors geras gyvas kaimynas yra girtas arba apnuodytas, tu miršti."
  },
  { 
    "id": "investigator" 
  },
  { 
    "id": "imp" 
  }
]
```

Šis apibrėžimo JSON apima pasirinktinį veikėją, Akrobatą, ir 2 bazinio žaidimo veikėjus. Bazinio žaidimo veikėjams pakanka pateikti tik ID, panašiai kaip gaunate iš Script Tool.

**Būtinos savybės:** `id`, `name`, `team`, `ability`

- **id**: vidinis veikėjo ID, be tarpų ar specialių simbolių<br>
  _Pastaba_: šis ID turi būti unikalus ir negali būti toks pat kaip bet kuris jau naudojamas esamo veikėjo ID, kitaip pasirinktinis veikėjas bus perrašytas esamu vaidmeniu!
- **image**: URL į veikėjo žetono ikonos PNG (turėtų turėti skaidrų foną!)<br>
  _Pastaba_: pasirinktiniai paveikslėliai bus matomi tik įjungus juos Grimuaro meniu!
- **edition**: edicijos ID šiam veikėjui. Gali būti paliktas tuščias arba „custom"
- **firstNight** / **otherNight**: pozicija, kuria šis veikėjas veikia pirmą / kitas naktis, palyginti su visais kitais veikėjais<br>
  _Pastaba_: turi būti teigiamas skaičius arba nulis, nulis reiškia „neveikia nakties metu"
- **firstNightReminder** / **otherNightReminder**: priminimo tekstas pirmai / kitoms naktims
- **reminders**: priminimo žetonai, turėtų būti tuščias masyvas `[]`, jei nėra
- **remindersGlobal**: globalūs priminimo žetonai, kurie visada bus prieinami, nesvarbu, ar veikėjas priskirtas žaidėjui, ar ne
- **setup**: ar šis žetonas veikia paruošimą (oranžinis lapas), kaip Girtuoklis ar Baronas
- **name**: rodomas veikėjo vardas
- **team**: veikėjo komanda, turi būti viena iš `townsfolk`, `outsider`, `minion`, `demon`, `traveler` arba `fabled`<br>
  _Pastaba_: jei sukuriate pasirinktinį Legendinį veikėją, jis bus automatiškai pridėtas į žaidimą, kai bus įkeltas pasirinktinis scenarijus
- **ability**: rodomas veikėjo gebėjimo tekstas

## Padėkos ir autorių teisės

* [Blood on the Clocktower](https://bloodontheclocktower.com/) yra Steven Medway ir [The Pandemonium Institute](https://www.thepandemoniuminstitute.com/) prekės ženklas
* Nakties priminimai ir kitas pagalbinis tekstas parašytas [Ben Finney](http://bignose.whitetree.org/projects/botc/diy/)
* Ikonografija [Font Awesome](https://fontawesome.com/)
* Fono paveikslėlio autorių teisės ir leidimas suteiktas [Ryan Maloney](https://www.artstation.com/maloney94)
* Žiniatinklio šriftai [Google Fonts](https://fonts.google.com/) ir [Online Web Fonts](https://www.onlinewebfonts.com/)
* Visi kiti paveikslėliai ir ikonos priklauso jų atitinkamiems savininkams

Šis projektas ir jo svetainė teikiami nemokamai ir nėra jokiu būdu susiję su The Pandemonium Institute.

## Originalus projektas

Šis projektas paremtas [bra1n/townsquare](https://github.com/bra1n/townsquare) - dėkojame už puikų darbą!
