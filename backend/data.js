import bcrypt from 'bcryptjs';

const data = {
  users: [
    {
      name: 'Artur',
      email: 'admin@example.com',
      password: bcrypt.hashSync('123456'),
      isAdmin: true,
    },
    {
      name: 'Tomasz',
      email: 'user@example.com',
      password: bcrypt.hashSync('123456'),
      isAdmin: false,
    },
  ],
  products: [
    {
      // _id: '1',
      name: 'Minecraft PC (Java & Bedrock Edition)',
      slug: 'minecraft',
      category: 'Gry survivalowe',
      image: '/images/p1.jpg', // 679px × 829px
      price: 107.99,
      countInStock: 10,
      rating: 0,
      numReviews: 0,
      description:
        'Minecraft – komputerowa gra survivalowa o otwartym świecie stworzona przez Markusa Perssona i rozwijana przez Mojang Studios. Minecraft pozwala graczom na budowanie i niszczenie obiektów położonych w losowo generowanym świecie gry. Gracz może atakować napotkane istoty, zbierać surowce czy wytwarzać przedmioty.',
    },
    {
      // _id: '2',
      name: 'Red Dead Redemption 2 PC Steam',
      slug: 'red-dead-2',
      category: 'Gry akcji',
      image: '/images/p2.jpg',
      price: 170.25,
      countInStock: 12,
      rating: 0,
      numReviews: 0,
      description:
        'Red Dead Redemption 2 – przygodowa gra akcji osadzona w realiach Dzikiego Zachodu, stworzona i wydana przez Rockstar Games. Gra została wydana na platformy Xbox One oraz PlayStation 4 26 października 2018, a 5 listopada 2019 wydano wersję na Microsoft Windows. Jest to kontynuacja serii Red Dead.',
    },
    {
      // _id: '3',
      name: 'Elden Ring PC Steam',
      slug: 'elden-ring',
      category: 'Gry fabularne',
      image: '/images/p3.jpg',
      price: 219.99,
      countInStock: 15,
      rating: 0,
      numReviews: 0,
      description:
        'Elden Ring – fabularna gra akcji wyprodukowana przez FromSoftware i wydana przez Namco Bandai Games. Za reżyserię gry odpowiedzialny był Hidetaka Miyazaki. Gra została wydana na PlayStation 4, PlayStation 5, Windows, Xbox One i Xbox Series X/S 25 lutego 2022 roku.',
    },
    {
      // _id: '4',
      name: 'Grand Theft Auto San Andreas PC Steam',
      slug: 'grand-theft-auto-sa',
      category: 'Gry akcji',
      image: '/images/p4.jpg',
      price: 59.99,
      countInStock: 5,
      rating: 0,
      numReviews: 0,
      description:
        'Grand Theft Auto: San Andreas – komputerowa gra akcji stworzona przez Rockstar North oraz wydana przez Rockstar Games. Gra należy do serii Grand Theft Auto. Produkcję wydano 25 października 2004 na konsolę PlayStation 2, a 7 czerwca 2005 na komputery i konsole Xbox.',
    },
  ],
};
export default data;
