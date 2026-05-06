export const BACKGROUNDS = [
  {
    id: 'wortgarten',
    url: 'assets/img/backgrounds/standard_board_preview.svg',
    name: 'Zauberwald'
  }
];

export function getDefaultBackground() {
  return BACKGROUNDS[0] || {
    id: 'wortgarten',
    url: 'assets/img/backgrounds/standard_board_preview.svg',
    name: 'Zauberwald'
  };
}

export function getBackgroundById(id) {
  return BACKGROUNDS.find((background) => background.id === id) || null;
}

export const EXTRACTED_CHARS = [
  {
    "id": "custom_0",
    "name_de": "Figur 1",
    "spriteImg": "assets/img/extracted/IMG_1915_3d.png"
  },
  {
    "id": "custom_1",
    "name_de": "Figur 2",
    "spriteImg": "assets/img/extracted/IMG_2601_3d.png"
  },
  {
    "id": "custom_2",
    "name_de": "Figur 3",
    "spriteImg": "assets/img/extracted/IMG_2604_3d.png"
  },
  {
    "id": "custom_3",
    "name_de": "Figur 4",
    "spriteImg": "assets/img/extracted/IMG_2605_3d.png"
  },
  {
    "id": "custom_4",
    "name_de": "Figur 5",
    "spriteImg": "assets/img/extracted/IMG_2606_3d.png"
  },
  {
    "id": "custom_5",
    "name_de": "Figur 6",
    "spriteImg": "assets/img/extracted/IMG_2608_3d.png"
  },
  {
    "id": "custom_6",
    "name_de": "Figur 7",
    "spriteImg": "assets/img/extracted/IMG_2868_3d.png"
  },
  {
    "id": "custom_7",
    "name_de": "Figur 8",
    "spriteImg": "assets/img/extracted/IMG_2869_3d.png"
  },
  {
    "id": "custom_8",
    "name_de": "Figur 9",
    "spriteImg": "assets/img/extracted/IMG_2875_3d.png"
  },
  {
    "id": "custom_9",
    "name_de": "Figur 10",
    "spriteImg": "assets/img/extracted/IMG_2876_3d.png"
  },
  {
    "id": "custom_10",
    "name_de": "Figur 11",
    "spriteImg": "assets/img/extracted/IMG_2877_3d.png"
  },
  {
    "id": "custom_11",
    "name_de": "Figur 12",
    "spriteImg": "assets/img/extracted/IMG_2878_3d.png"
  },
  {
    "id": "custom_12",
    "name_de": "Figur 13",
    "spriteImg": "assets/img/extracted/IMG_2879_3d.png"
  },
  {
    "id": "custom_13",
    "name_de": "Figur 14",
    "spriteImg": "assets/img/extracted/IMG_2880_3d.png"
  },
  {
    "id": "custom_14",
    "name_de": "Figur 15",
    "spriteImg": "assets/img/extracted/IMG_2881_3d.png"
  },
  {
    "id": "custom_15",
    "name_de": "Figur 16",
    "spriteImg": "assets/img/extracted/IMG_2882_3d.png"
  },
  {
    "id": "custom_16",
    "name_de": "Figur 17",
    "spriteImg": "assets/img/extracted/IMG_2883_3d.png"
  },
  {
    "id": "custom_17",
    "name_de": "Figur 18",
    "spriteImg": "assets/img/extracted/IMG_2884_3d.png"
  },
  {
    "id": "custom_18",
    "name_de": "Figur 19",
    "spriteImg": "assets/img/extracted/IMG_2885_3d.png"
  },
  {
    "id": "custom_19",
    "name_de": "Figur 20",
    "spriteImg": "assets/img/extracted/IMG_2886_3d.png"
  },
  {
    "id": "custom_20",
    "name_de": "Figur 21",
    "spriteImg": "assets/img/extracted/IMG_2890_3d.png"
  },
  {
    "id": "custom_21",
    "name_de": "Figur 22",
    "spriteImg": "assets/img/extracted/IMG_2894_3d.png"
  },
  {
    "id": "custom_22",
    "name_de": "Figur 23",
    "spriteImg": "assets/img/extracted/IMG_2896_3d.png"
  },
  {
    "id": "custom_23",
    "name_de": "Figur 24",
    "spriteImg": "assets/img/extracted/IMG_2897_3d.png"
  },
  {
    "id": "custom_24",
    "name_de": "Figur 25",
    "spriteImg": "assets/img/extracted/IMG_2898_3d.png"
  },
  {
    "id": "custom_25",
    "name_de": "Figur 26",
    "spriteImg": "assets/img/extracted/IMG_2900_3d.png"
  },
  {
    "id": "custom_26",
    "name_de": "Figur 27",
    "spriteImg": "assets/img/extracted/IMG_2909_3d.png"
  },
  {
    "id": "custom_27",
    "name_de": "Figur 28",
    "spriteImg": "assets/img/extracted/IMG_2993_3d.png"
  },
  {
    "id": "custom_28",
    "name_de": "Figur 29",
    "spriteImg": "assets/img/extracted/IMG_2994_3d.png"
  },
  {
    "id": "custom_29",
    "name_de": "Figur 30",
    "spriteImg": "assets/img/extracted/IMG_3580_3d.png"
  },
  {
    "id": "custom_30",
    "name_de": "Figur 31",
    "spriteImg": "assets/img/extracted/IMG_6667 2_3d.png"
  },
  {
    "id": "custom_31",
    "name_de": "Figur 32",
    "spriteImg": "assets/img/extracted/IMG_6667_3d.png"
  },
  {
    "id": "custom_32",
    "name_de": "Figur 33",
    "spriteImg": "assets/img/extracted/IMG_6668 2_3d.png"
  },
  {
    "id": "custom_33",
    "name_de": "Figur 34",
    "spriteImg": "assets/img/extracted/IMG_6668_3d.png"
  },
  {
    "id": "custom_34",
    "name_de": "Figur 35",
    "spriteImg": "assets/img/extracted/IMG_6670_3d.png"
  },
  {
    "id": "custom_35",
    "name_de": "Figur 36",
    "spriteImg": "assets/img/extracted/IMG_6708_3d.png"
  },
  {
    "id": "custom_36",
    "name_de": "Figur 37",
    "spriteImg": "assets/img/extracted/IMG_7174_3d.png"
  },
  {
    "id": "custom_37",
    "name_de": "Figur 38",
    "spriteImg": "assets/img/extracted/IMG_7385_3d.png"
  },
  {
    "id": "custom_38",
    "name_de": "Figur 39",
    "spriteImg": "assets/img/extracted/IMG_7445_3d.png"
  },
  {
    "id": "custom_39",
    "name_de": "Figur 40",
    "spriteImg": "assets/img/extracted/IMG_7985_3d.png"
  },
  {
    "id": "custom_40",
    "name_de": "Figur 41",
    "spriteImg": "assets/img/extracted/IMG_8121_3d.png"
  },
  {
    "id": "custom_41",
    "name_de": "Figur 42",
    "spriteImg": "assets/img/extracted/IMG_8393_3d.png"
  },
  {
    "id": "custom_42",
    "name_de": "Figur 43",
    "spriteImg": "assets/img/extracted/IMG_9014_3d.png"
  },
  {
    "id": "custom_43",
    "name_de": "Figur 44",
    "spriteImg": "assets/img/extracted/IMG_9026_3d.png"
  }
];
