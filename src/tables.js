/* ================================================================
   TABELAS — ABNT NBR 5410:2004 (versão corrigida 2008)
   Valores conferidos com o Guia de Dimensionamento de Cabos para
   Baixa Tensão (Prysmian, Rev. 9, 2020), que reproduz a norma.
   ================================================================ */
'use strict';

const SECOES_CU = [0.5, 0.75, 1, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500, 630, 800, 1000];
const SECOES_AL = [16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500, 630, 800, 1000];
const SECOES = SECOES_CU;

/* Tabela 36 — PVC ou LSHF/A, 70 °C. Ar 30 °C, solo 20 °C (método D: 2,5 K·m/W, 0,7 m)
   Colunas: A1-2, A1-3, A2-2, A2-3, B1-2, B1-3, B2-2, B2-3, C-2, C-3, D-2, D-3 */
const T36 = {
  Cu: {
    0.5: [7, 7, 7, 7, 9, 8, 9, 8, 10, 9, 12, 10], 0.75: [9, 9, 9, 9, 11, 10, 11, 10, 13, 11, 15, 12], 1: [11, 10, 11, 10, 14, 12, 13, 12, 15, 14, 18, 15],
    1.5: [14.5, 13.5, 14, 13, 17.5, 15.5, 16.5, 15, 19.5, 17.5, 22, 18], 2.5: [19.5, 18, 18.5, 17.5, 24, 21, 23, 20, 27, 24, 29, 24],
    4: [26, 24, 25, 23, 32, 28, 30, 27, 36, 32, 38, 31], 6: [34, 31, 32, 29, 41, 36, 38, 34, 46, 41, 47, 39],
    10: [46, 42, 43, 39, 57, 50, 52, 46, 63, 57, 63, 52], 16: [61, 56, 57, 52, 76, 68, 69, 62, 85, 76, 81, 67],
    25: [80, 73, 75, 68, 101, 89, 90, 80, 112, 96, 104, 86], 35: [99, 89, 92, 83, 125, 110, 111, 99, 138, 119, 125, 103],
    50: [119, 108, 110, 99, 151, 134, 133, 118, 168, 144, 148, 122], 70: [151, 136, 139, 125, 192, 171, 168, 149, 213, 184, 183, 151],
    95: [182, 164, 167, 150, 232, 207, 201, 179, 258, 223, 216, 179], 120: [210, 188, 192, 172, 269, 239, 232, 206, 299, 259, 246, 203],
    150: [240, 216, 219, 196, 309, 275, 265, 236, 344, 299, 278, 230], 185: [273, 245, 248, 223, 353, 314, 300, 268, 392, 341, 312, 258],
    240: [321, 286, 291, 261, 415, 370, 351, 313, 461, 403, 361, 297], 300: [367, 328, 334, 298, 477, 426, 401, 358, 530, 464, 408, 336],
    400: [438, 390, 398, 355, 571, 510, 477, 425, 634, 557, 478, 394], 500: [502, 447, 456, 406, 656, 587, 545, 486, 729, 642, 540, 445],
    630: [578, 514, 526, 467, 758, 678, 626, 559, 843, 743, 614, 506], 800: [669, 593, 609, 540, 881, 788, 723, 645, 978, 865, 700, 577],
    1000: [767, 679, 698, 618, 1012, 906, 827, 738, 1125, 996, 792, 652]
  },
  Al: {
    16: [48, 43, 44, 41, 60, 53, 54, 48, 66, 59, 62, 52], 25: [63, 57, 58, 53, 79, 70, 71, 62, 83, 73, 80, 66],
    35: [77, 70, 71, 65, 97, 86, 86, 77, 103, 90, 96, 80], 50: [93, 84, 86, 78, 118, 104, 104, 92, 125, 110, 113, 94],
    70: [118, 107, 108, 98, 150, 133, 131, 116, 160, 140, 140, 117], 95: [142, 129, 130, 118, 181, 161, 157, 139, 195, 170, 166, 138],
    120: [164, 149, 150, 135, 210, 186, 181, 160, 226, 197, 189, 157], 150: [189, 170, 172, 155, 241, 214, 206, 183, 261, 227, 213, 178],
    185: [215, 194, 195, 176, 275, 245, 234, 208, 298, 259, 240, 200], 240: [252, 227, 229, 207, 324, 288, 274, 243, 352, 305, 277, 230],
    300: [289, 261, 263, 237, 372, 331, 313, 278, 406, 351, 313, 260], 400: [345, 311, 314, 283, 446, 397, 372, 331, 488, 422, 366, 305],
    500: [396, 356, 360, 324, 512, 456, 425, 378, 563, 486, 414, 345], 630: [456, 410, 416, 373, 592, 527, 488, 435, 653, 562, 471, 391],
    800: [529, 475, 482, 432, 687, 612, 563, 502, 761, 654, 537, 446], 1000: [607, 544, 552, 495, 790, 704, 643, 574, 878, 753, 607, 505]
  }
};
/* Tabela 37 — EPR, HEPR ou XLPE, 90 °C. Mesmas colunas da Tabela 36 */
const T37 = {
  Cu: {
    0.5: [10, 9, 10, 9, 12, 10, 11, 10, 12, 11, 14, 12], 0.75: [12, 11, 12, 11, 15, 13, 15, 13, 16, 14, 18, 15], 1: [15, 13, 14, 13, 18, 16, 17, 15, 19, 17, 21, 17],
    1.5: [19, 17, 18.5, 16.5, 23, 20, 22, 19.5, 24, 22, 26, 22], 2.5: [26, 23, 25, 22, 31, 28, 30, 26, 33, 30, 34, 29],
    4: [35, 31, 33, 30, 42, 37, 40, 35, 45, 40, 44, 37], 6: [45, 40, 42, 38, 54, 48, 51, 44, 58, 52, 56, 46],
    10: [61, 54, 57, 51, 75, 66, 69, 60, 80, 71, 73, 61], 16: [81, 73, 76, 68, 100, 88, 91, 80, 107, 96, 95, 79],
    25: [106, 95, 99, 89, 133, 117, 119, 105, 138, 119, 121, 101], 35: [131, 117, 121, 109, 164, 144, 146, 128, 171, 147, 146, 122],
    50: [158, 141, 145, 130, 198, 175, 175, 154, 209, 179, 173, 144], 70: [200, 179, 183, 164, 253, 222, 221, 194, 269, 229, 213, 178],
    95: [241, 216, 220, 197, 306, 269, 265, 233, 328, 278, 252, 211], 120: [278, 249, 253, 227, 354, 312, 305, 268, 382, 322, 287, 240],
    150: [318, 285, 290, 259, 407, 358, 349, 307, 441, 371, 324, 271], 185: [362, 324, 329, 295, 464, 408, 395, 348, 506, 424, 363, 304],
    240: [424, 380, 386, 346, 546, 481, 462, 407, 599, 500, 419, 351], 300: [486, 435, 442, 396, 628, 553, 529, 465, 693, 576, 474, 396],
    400: [579, 519, 527, 472, 751, 661, 628, 552, 835, 692, 555, 464], 500: [664, 595, 604, 541, 864, 760, 718, 631, 966, 797, 627, 525],
    630: [765, 685, 696, 623, 998, 879, 825, 725, 1122, 923, 711, 596], 800: [885, 792, 805, 721, 1158, 1020, 952, 837, 1311, 1074, 811, 679],
    1000: [1014, 908, 923, 826, 1332, 1173, 1088, 957, 1515, 1237, 916, 767]
  },
  Al: {
    16: [64, 58, 60, 55, 79, 71, 72, 64, 84, 76, 73, 61], 25: [84, 76, 78, 71, 105, 93, 94, 84, 101, 90, 93, 78],
    35: [103, 94, 96, 87, 130, 116, 115, 103, 126, 112, 112, 94], 50: [125, 113, 115, 104, 157, 140, 138, 124, 154, 136, 132, 112],
    70: [158, 142, 145, 131, 200, 179, 175, 156, 198, 174, 163, 138], 95: [191, 171, 175, 157, 242, 217, 210, 188, 241, 211, 193, 164],
    120: [220, 197, 201, 180, 281, 251, 242, 216, 280, 245, 220, 186], 150: [253, 226, 230, 206, 323, 289, 277, 248, 324, 283, 249, 210],
    185: [288, 256, 262, 233, 368, 330, 314, 281, 371, 323, 279, 236], 240: [338, 300, 307, 273, 433, 389, 368, 329, 439, 382, 322, 272],
    300: [387, 344, 352, 313, 499, 447, 421, 377, 508, 440, 364, 308], 400: [462, 409, 421, 372, 597, 536, 500, 448, 612, 529, 426, 361],
    500: [530, 468, 483, 426, 687, 617, 573, 513, 707, 610, 482, 408], 630: [611, 538, 556, 490, 794, 714, 658, 590, 821, 707, 547, 464],
    800: [708, 622, 644, 566, 922, 830, 760, 682, 958, 824, 624, 529], 1000: [812, 712, 739, 648, 1061, 955, 870, 780, 1108, 950, 706, 598]
  }
};
/* Tabela 38 (PVC/LSHF-A, 70 °C) e Tabela 39 (EPR/HEPR/XLPE, 90 °C) — métodos E, F e G, ar 30 °C
   Colunas: E-2, E-3, F-2 justapostos, F-3 trifólio, F-3 plano justapostos, G horizontal espaçados, G vertical espaçados */
const T38 = {
  Cu: {
    0.5: [11, 9, 11, 8, 9, 12, 10], 0.75: [14, 12, 14, 11, 11, 16, 13], 1: [17, 14, 17, 13, 14, 19, 16],
    1.5: [22, 18.5, 22, 17, 18, 24, 21], 2.5: [30, 25, 31, 24, 25, 34, 29], 4: [40, 34, 41, 33, 34, 45, 39],
    6: [51, 43, 53, 43, 45, 59, 51], 10: [70, 60, 73, 60, 63, 81, 71], 16: [94, 80, 99, 82, 85, 110, 97],
    25: [119, 101, 131, 110, 114, 146, 130], 35: [148, 126, 162, 137, 143, 181, 162], 50: [180, 153, 196, 167, 174, 219, 197],
    70: [232, 196, 251, 216, 225, 281, 254], 95: [282, 238, 304, 264, 275, 341, 311], 120: [328, 276, 352, 308, 321, 396, 362],
    150: [379, 319, 406, 356, 372, 456, 419], 185: [434, 364, 463, 409, 427, 521, 480], 240: [514, 430, 546, 485, 507, 615, 569],
    300: [593, 497, 629, 561, 587, 709, 659], 400: [715, 597, 754, 656, 689, 852, 795], 500: [826, 689, 868, 749, 789, 982, 920],
    630: [958, 798, 1005, 855, 905, 1138, 1070], 800: [1118, 930, 1169, 971, 1119, 1325, 1251], 1000: [1292, 1073, 1346, 1079, 1296, 1528, 1448]
  },
  Al: {
    16: [73, 61, 73, 62, 65, 84, 73], 25: [89, 78, 98, 84, 87, 112, 99], 35: [111, 96, 122, 105, 109, 139, 124],
    50: [135, 117, 149, 128, 133, 169, 152], 70: [173, 150, 192, 166, 173, 217, 196], 95: [210, 183, 235, 203, 212, 265, 241],
    120: [244, 212, 273, 237, 247, 308, 282], 150: [282, 245, 316, 274, 287, 356, 327], 185: [322, 280, 363, 315, 330, 407, 376],
    240: [380, 330, 430, 375, 392, 482, 447], 300: [439, 381, 497, 434, 455, 557, 519], 400: [528, 458, 600, 526, 552, 671, 629],
    500: [608, 528, 694, 610, 640, 775, 730], 630: [705, 613, 808, 711, 640, 775, 730], 800: [822, 714, 944, 832, 875, 1050, 1000],
    1000: [948, 823, 1092, 965, 1015, 1213, 1161]
  }
};
const T39 = {
  Cu: {
    0.5: [13, 12, 13, 10, 10, 15, 12], 0.75: [17, 15, 17, 13, 14, 19, 16], 1: [21, 18, 21, 16, 17, 23, 19],
    1.5: [26, 23, 27, 21, 22, 30, 25], 2.5: [36, 32, 37, 29, 30, 41, 35], 4: [49, 42, 50, 40, 42, 56, 48],
    6: [63, 54, 65, 53, 55, 73, 63], 10: [86, 75, 90, 74, 77, 101, 88], 16: [115, 100, 121, 101, 105, 137, 120],
    25: [149, 127, 161, 135, 141, 182, 161], 35: [185, 158, 200, 169, 176, 226, 201], 50: [225, 192, 242, 207, 216, 275, 246],
    70: [289, 246, 310, 268, 279, 353, 318], 95: [352, 298, 377, 328, 342, 430, 389], 120: [410, 346, 437, 383, 400, 500, 454],
    150: [473, 399, 504, 444, 464, 577, 527], 185: [542, 456, 575, 510, 533, 661, 605], 240: [641, 538, 679, 607, 634, 781, 719],
    300: [741, 621, 783, 703, 736, 902, 833], 400: [892, 745, 940, 823, 868, 1085, 1008], 500: [1030, 859, 1083, 946, 998, 1253, 1169],
    630: [1196, 995, 1254, 1088, 1151, 1454, 1362], 800: [1396, 1159, 1460, 1252, 1328, 1696, 1595], 1000: [1613, 1336, 1683, 1420, 1511, 1958, 1849]
  },
  Al: {
    16: [91, 77, 90, 76, 79, 103, 90], 25: [108, 97, 121, 103, 107, 138, 122], 35: [135, 120, 150, 129, 135, 172, 153],
    50: [164, 146, 184, 159, 165, 210, 188], 70: [211, 187, 237, 206, 215, 271, 244], 95: [257, 227, 289, 253, 264, 332, 300],
    120: [300, 263, 337, 296, 308, 387, 351], 150: [346, 304, 389, 343, 358, 448, 408], 185: [397, 347, 447, 395, 413, 515, 470],
    240: [470, 409, 530, 471, 492, 611, 561], 300: [543, 471, 613, 547, 571, 708, 652], 400: [654, 566, 740, 663, 694, 856, 792],
    500: [756, 652, 856, 770, 806, 991, 921], 630: [879, 755, 996, 899, 942, 1154, 1077], 800: [1026, 879, 1164, 1056, 1106, 1351, 1266],
    1000: [1186, 1012, 1347, 1226, 1285, 1565, 1472]
  }
};
const COLS_ABCD = ['A1', 'A2', 'B1', 'B2', 'C', 'D'];
const COLS_EFG = ['E — 2 carregados', 'E — 3 carregados', 'F — 2 justapostos', 'F — 3 em trifólio', 'F — 3 em plano', 'G — horizontal espaçados', 'G — vertical espaçados'];

/* Tabela 35 — temperaturas características dos condutores (°C) */
const T35 = [
  ['PVC — até 300 mm²', 70, 100, 160], ['PVC — acima de 300 mm²', 70, 100, 140],
  ['LSHF/A (não halogenado)', 70, 100, 160], ['EPR / HEPR', 90, 130, 250], ['XLPE', 90, 130, 250]
];

/* Tabela 40 — fatores de correção de temperatura: [PVC ar, EPR/XLPE ar, PVC solo, EPR/XLPE solo] */
const T40 = {
  10: [1.22, 1.15, 1.10, 1.07], 15: [1.17, 1.12, 1.05, 1.04], 20: [1.12, 1.08, 1.00, 1.00], 25: [1.06, 1.04, 0.95, 0.96],
  30: [1.00, 1.00, 0.89, 0.93], 35: [0.94, 0.96, 0.84, 0.89], 40: [0.87, 0.91, 0.77, 0.85], 45: [0.79, 0.87, 0.71, 0.80],
  50: [0.71, 0.82, 0.63, 0.76], 55: [0.61, 0.76, 0.55, 0.71], 60: [0.50, 0.71, 0.45, 0.65], 65: [null, 0.65, null, 0.60],
  70: [null, 0.58, null, 0.53], 75: [null, 0.50, null, 0.46], 80: [null, 0.41, null, 0.38]
};
/* Tabela 41 — resistividade térmica do solo (K·m/W), complementada pela IEC 60364-5-52:2009 */
const T41 = {
  duto: { 0.5: 1.28, 0.7: 1.20, 1: 1.18, 1.5: 1.10, 2: 1.05, 2.5: 1.00, 3: 0.96 },
  direto: { 0.5: 1.88, 0.7: 1.62, 1: 1.50, 1.5: 1.28, 2: 1.12, 2.5: 1.00, 3: 0.90 }
};
/* Tabela 42 — agrupamento em feixe ou camada única. Índices: 1..8, 9-11, 12-15, 16-19, ≥20 */
const T42 = {
  1: [1.00, 0.80, 0.70, 0.65, 0.60, 0.57, 0.54, 0.52, 0.50, 0.45, 0.41, 0.38],
  2: [1.00, 0.85, 0.79, 0.75, 0.73, 0.72, 0.72, 0.71, 0.70],
  3: [0.95, 0.81, 0.72, 0.68, 0.66, 0.64, 0.63, 0.62, 0.61],
  4: [1.00, 0.88, 0.82, 0.77, 0.75, 0.73, 0.73, 0.72, 0.72],
  5: [1.00, 0.87, 0.82, 0.80, 0.80, 0.79, 0.79, 0.78, 0.78]
};
const REF42 = {
  1: 'Em feixe: ao ar livre ou sobre superfície; embutidos; em conduto fechado',
  2: 'Camada única sobre parede, piso, ou em bandeja não perfurada ou prateleira',
  3: 'Camada única no teto',
  4: 'Camada única em bandeja perfurada',
  5: 'Camada única sobre leito, suporte etc.'
};
/* Tabela 43 — mais de uma camada (métodos C, E e F). Linhas: camadas 2, 3, 4-5, 6-8, ≥9; colunas: circuitos por camada 2, 3, 4-5, 6-8, ≥9 */
const T43 = [[0.68, 0.62, 0.60, 0.58, 0.56], [0.62, 0.57, 0.55, 0.53, 0.51], [0.60, 0.55, 0.52, 0.51, 0.49], [0.58, 0.53, 0.51, 0.49, 0.48], [0.56, 0.51, 0.49, 0.48, 0.46]];
const T43_ROT = ['2', '3', '4 ou 5', '6 a 8', '9 ou mais'];
const idx43 = n => n <= 2 ? 0 : n === 3 ? 1 : n <= 5 ? 2 : n <= 8 ? 3 : 4;
/* Tabela 44 — cabos diretamente enterrados (0,7 m; 2,5 K·m/W). Espaçamento: nulo, 1 diâmetro, 0,125 m, 0,25 m, 0,5 m */
const T44 = {
  2: [0.75, 0.80, 0.85, 0.90, 0.90], 3: [0.65, 0.70, 0.75, 0.80, 0.85], 4: [0.60, 0.60, 0.70, 0.75, 0.80], 5: [0.55, 0.55, 0.65, 0.70, 0.80],
  6: [0.50, 0.55, 0.60, 0.70, 0.80], 7: [0.45, 0.51, 0.59, 0.67, 0.76], 8: [0.43, 0.48, 0.57, 0.65, 0.75], 9: [0.41, 0.46, 0.55, 0.63, 0.74],
  12: [0.36, 0.42, 0.51, 0.59, 0.71], 16: [0.32, 0.38, 0.47, 0.56, 0.68], 20: [0.29, 0.35, 0.44, 0.53, 0.66]
};
const ESP44 = ['nula (cabos em contato)', 'um diâmetro de cabo', '0,125 m', '0,25 m', '0,5 m'];
/* Tabela 45 — circuitos em dutos individuais enterrados. Espaçamento: nulo, 0,25 m, 0,5 m, 1,0 m */
const T45M = {
  2: [0.85, 0.90, 0.95, 0.95], 3: [0.75, 0.85, 0.90, 0.95], 4: [0.70, 0.80, 0.85, 0.90], 5: [0.65, 0.80, 0.85, 0.90], 6: [0.60, 0.80, 0.80, 0.80],
  7: [0.57, 0.76, 0.80, 0.88], 8: [0.54, 0.74, 0.78, 0.88], 9: [0.52, 0.73, 0.77, 0.87], 10: [0.49, 0.72, 0.76, 0.86], 11: [0.47, 0.70, 0.75, 0.86],
  12: [0.45, 0.69, 0.74, 0.85], 13: [0.44, 0.68, 0.73, 0.85], 14: [0.42, 0.68, 0.72, 0.84], 15: [0.41, 0.67, 0.72, 0.84], 16: [0.39, 0.66, 0.71, 0.83],
  17: [0.38, 0.65, 0.70, 0.83], 18: [0.37, 0.65, 0.70, 0.83], 19: [0.35, 0.64, 0.69, 0.82], 20: [0.34, 0.63, 0.68, 0.82]
};
const T45U = {
  2: [0.80, 0.90, 0.90, 0.95], 3: [0.70, 0.80, 0.85, 0.90], 4: [0.65, 0.75, 0.80, 0.90], 5: [0.60, 0.70, 0.80, 0.90], 6: [0.60, 0.70, 0.80, 0.90],
  7: [0.53, 0.66, 0.76, 0.87], 8: [0.50, 0.63, 0.74, 0.87], 9: [0.47, 0.61, 0.73, 0.86], 10: [0.45, 0.59, 0.72, 0.85], 11: [0.43, 0.57, 0.70, 0.85],
  12: [0.41, 0.56, 0.69, 0.84], 13: [0.39, 0.54, 0.68, 0.84], 14: [0.37, 0.53, 0.68, 0.83], 15: [0.35, 0.52, 0.67, 0.83], 16: [0.34, 0.51, 0.66, 0.83],
  17: [0.33, 0.50, 0.65, 0.82], 18: [0.31, 0.49, 0.65, 0.82], 19: [0.30, 0.48, 0.64, 0.82], 20: [0.29, 0.47, 0.63, 0.81]
};
const ESP45 = ['nulo (dutos em contato)', '0,25 m', '0,5 m', '1,0 m'];

/* Tabela 47 — seção mínima dos condutores (mm²) */
const T47 = [
  ['Instalações fixas — condutores e cabos isolados', 'Circuitos de iluminação', '1,5 Cu / 16 Al'],
  ['', 'Circuitos de força (inclusive tomadas)', '2,5 Cu / 16 Al'],
  ['', 'Circuitos de sinalização e controle', '0,5 Cu (0,1 mm² para equipamentos eletrônicos)'],
  ['Instalações fixas — condutores nus', 'Circuitos de força', '10 Cu / 16 Al'],
  ['', 'Circuitos de sinalização e controle', '4 Cu'],
  ['Linhas flexíveis com cabos isolados', 'Para um equipamento específico', 'Conforme a norma do equipamento'],
  ['', 'Para qualquer outra aplicação', '0,75 Cu (0,1 mm² em cabos com 7 ou mais veias)'],
  ['', 'Circuitos a extrabaixa tensão para aplicações especiais', '0,75 Cu']
];
/* Tabela 48 — seção reduzida do neutro (fase > 25 mm²) */
const T48 = { 35: 25, 50: 25, 70: 35, 95: 50, 120: 70, 150: 70, 185: 95, 240: 120, 300: 150, 400: 185 };

/* Resistência em c.c. a 20 °C (Ω/km) — ABNT NBR NM 280 */
const R20 = {
  Cu5: { 0.5: 39.0, 0.75: 26.0, 1: 19.5, 1.5: 13.3, 2.5: 7.98, 4: 4.95, 6: 3.30, 10: 1.91, 16: 1.21, 25: 0.780, 35: 0.554, 50: 0.386, 70: 0.272, 95: 0.206, 120: 0.161, 150: 0.129, 185: 0.106, 240: 0.0801, 300: 0.0641, 400: 0.0486, 500: 0.0384, 630: 0.0287 },
  Cu2: { 0.5: 36.0, 0.75: 24.5, 1: 18.1, 1.5: 12.1, 2.5: 7.41, 4: 4.61, 6: 3.08, 10: 1.83, 16: 1.15, 25: 0.727, 35: 0.524, 50: 0.387, 70: 0.268, 95: 0.193, 120: 0.153, 150: 0.124, 185: 0.0991, 240: 0.0754, 300: 0.0601, 400: 0.0470, 500: 0.0366, 630: 0.0283, 800: 0.0221, 1000: 0.0176 },
  Al2: { 16: 1.91, 25: 1.20, 35: 0.868, 50: 0.641, 70: 0.443, 95: 0.320, 120: 0.253, 150: 0.206, 185: 0.164, 240: 0.125, 300: 0.100, 400: 0.0778, 500: 0.0605, 630: 0.0469, 800: 0.0367, 1000: 0.0291 }
};
const ALFA = { Cu: 0.00393, Al: 0.00403 };
const RHO_TN = { Cu: 0.0225, Al: 0.036 };   // Ω·mm²/m — método convencional (TN)

/* Isolações: grupo térmico, temperaturas (Tabela 35) e fator k (5.3.5.5.2) */
const ISOL = { PVC: 'PVC 70 °C', LSHF: 'LSHF/A 70 °C (não halogenado)', EPR: 'EPR/HEPR 90 °C', XLPE: 'XLPE 90 °C' };
const grupoIsol = i => (i === 'EPR' || i === 'XLPE') ? 'EPR' : 'PVC';
const THETA = i => grupoIsol(i) === 'EPR' ? 90 : 70;
const THETA_CC = (i, S) => grupoIsol(i) === 'EPR' ? 250 : (i === 'PVC' && S > 300 ? 140 : 160);
function fatorK(mat, i, S) {
  if (grupoIsol(i) === 'EPR') return mat === 'Al' ? 94 : 143;
  if (i === 'PVC' && S > 300) return mat === 'Al' ? 68 : 103;
  return mat === 'Al' ? 76 : 115;
}
/* k para condutor de proteção (6.4.3.1.2): veia de cabo multipolar, enfeixado ou no mesmo conduto (= k do condutor) e isolado separado */
function fatorKPE(mat, i, S, separado) {
  if (!separado) return fatorK(mat, i, S);
  if (grupoIsol(i) === 'EPR') return mat === 'Al' ? 116 : 176;
  if (i === 'PVC' && S > 300) return mat === 'Al' ? 88 : 133;
  return mat === 'Al' ? 95 : 143;
}
const KTAB = [
  ['Cobre', 115, 103, 115, 143], ['Alumínio', 76, 68, 76, 94]
];
const KPE_TAB = {
  isolado: [['Cobre', 143, 133, 176, 143], ['Alumínio', 95, 88, 116, 95], ['Aço', 52, 49, 64, 52]],
  veia: [['Cobre', 115, 103, 143, 115], ['Alumínio', 76, 68, 94, 76], ['Aço', 42, 37, 52, 42]],
  nuCobertura: [['Cobre', 159, 138, 151], ['Alumínio', 105, 91, 100], ['Aço', 58, 50, 55]],
  armacao: [['Cobre', 141, 128], ['Alumínio', 93, 85], ['Chumbo', 26, 23], ['Aço', 51, 46]],
  nu: [['Visível e em áreas restritas', 30, 228, 500, 125, 300, 82, 500], ['Condições normais', 30, 159, 200, 105, 200, 58, 200], ['Risco de incêndio', 30, 138, 150, 91, 150, 50, 150]]
};

/* Eletroduto de aço (ferromagnético): multiplicador da queda de tensão (guia, item 6.5) */
function fatorFerro(S, fp) {
  if (fp >= 0.875) return S <= 185 ? 1 : 1.16;
  return S <= 70 ? 1 : (S <= 185 ? 1.06 : 1.18);
}

/* Tabela 33 — tipos de linhas elétricas. ref: método de referência; 'EF' = E (multipolar) ou F (unipolares);
   vde: 5 ou 20 quando o método depende da relação V/De (B2 abaixo, B1 acima); conduto: 'circ' | 'ncirc' | null */
const METODOS = [
  { id: '1', ref: 'A1', conduto: 'circ', tipos: ['isolado', 'unipolar'], cena: 'isolante', cont: 'trio', tubo: 'circ', desc: 'Condutores isolados ou cabos unipolares em eletroduto de seção circular embutido em parede termicamente isolante' },
  { id: '2', ref: 'A2', conduto: 'circ', tipos: ['multipolar'], cena: 'isolante', cont: 'multi', tubo: 'circ', desc: 'Cabo multipolar em eletroduto de seção circular embutido em parede termicamente isolante' },
  { id: '3', ref: 'B1', conduto: 'circ', tipos: ['isolado', 'unipolar'], cena: 'parede', cont: 'trio', tubo: 'circ', desc: 'Condutores isolados ou cabos unipolares em eletroduto aparente de seção circular sobre parede ou espaçado desta menos de 0,3 vez o diâmetro do eletroduto' },
  { id: '4', ref: 'B2', conduto: 'circ', tipos: ['multipolar'], cena: 'parede', cont: 'multi', tubo: 'circ', desc: 'Cabo multipolar em eletroduto aparente de seção circular sobre parede ou espaçado desta menos de 0,3 vez o diâmetro do eletroduto' },
  { id: '5', ref: 'B1', conduto: 'ncirc', tipos: ['isolado', 'unipolar'], cena: 'parede', cont: 'trio', tubo: 'rect', desc: 'Condutores isolados ou cabos unipolares em eletroduto aparente de seção não-circular sobre parede' },
  { id: '6', ref: 'B2', conduto: 'ncirc', tipos: ['multipolar'], cena: 'parede', cont: 'multi', tubo: 'rect', desc: 'Cabo multipolar em eletroduto aparente de seção não-circular sobre parede' },
  { id: '7', ref: 'B1', conduto: 'circ', tipos: ['isolado', 'unipolar'], cena: 'alvenaria', cont: 'trio', tubo: 'circ', desc: 'Condutores isolados ou cabos unipolares em eletroduto de seção circular embutido em alvenaria' },
  { id: '8', ref: 'B2', conduto: 'circ', tipos: ['multipolar'], cena: 'alvenaria', cont: 'multi', tubo: 'circ', desc: 'Cabo multipolar em eletroduto de seção circular embutido em alvenaria' },
  { id: '11', ref: 'C', conduto: null, tipos: ['unipolar', 'multipolar'], cena: 'parede', cont: 'cabos', desc: 'Cabos unipolares ou cabo multipolar sobre parede ou espaçado desta menos de 0,3 vez o diâmetro do cabo' },
  { id: '11A', ref: 'C', conduto: null, tipos: ['unipolar', 'multipolar'], cena: 'teto', cont: 'cabos', desc: 'Cabos unipolares ou cabo multipolar fixado diretamente no teto' },
  { id: '11B', ref: 'C', conduto: null, tipos: ['unipolar', 'multipolar'], cena: 'tetoAfastado', cont: 'cabos', desc: 'Cabos unipolares ou cabo multipolar afastado do teto mais de 0,3 vez o diâmetro do cabo' },
  { id: '12', ref: 'C', conduto: null, tipos: ['unipolar', 'multipolar'], cena: 'bandeja', cont: 'cabos', desc: 'Cabos unipolares ou cabo multipolar em bandeja não perfurada, perfilado ou prateleira' },
  { id: '13', ref: 'EF', conduto: null, tipos: ['unipolar', 'multipolar'], cena: 'bandejaPerf', cont: 'cabos', desc: 'Cabos unipolares ou cabo multipolar em bandeja perfurada, horizontal ou vertical' },
  { id: '14', ref: 'EF', conduto: null, tipos: ['unipolar', 'multipolar'], cena: 'tela', cont: 'cabos', desc: 'Cabos unipolares ou cabo multipolar sobre suportes horizontais, eletrocalha aramada ou tela' },
  { id: '15', ref: 'EF', conduto: null, tipos: ['unipolar', 'multipolar'], cena: 'afastado', cont: 'cabos', desc: 'Cabos unipolares ou cabo multipolar afastado(s) da parede mais de 0,3 vez o diâmetro do cabo' },
  { id: '16', ref: 'EF', conduto: null, tipos: ['unipolar', 'multipolar'], cena: 'leito', cont: 'cabos', desc: 'Cabos unipolares ou cabo multipolar em leito' },
  { id: '17', ref: 'EF', conduto: null, tipos: ['unipolar', 'multipolar'], cena: 'suspenso', cont: 'cabos', desc: 'Cabos unipolares ou cabo multipolar suspenso(s) por cabo de suporte, incorporado ou não' },
  { id: '18', ref: 'G', conduto: null, tipos: ['isolado', 'unipolar'], cena: 'isoladores', cont: 'nus', desc: 'Condutores nus ou isolados sobre isoladores' },
  { id: '21', ref: 'B2', vde: 5, conduto: null, tipos: ['unipolar', 'multipolar'], cena: 'espaco', cont: 'cabos', desc: 'Cabos unipolares ou cabos multipolares em espaço de construção, lançados diretamente sobre a superfície do espaço ou instalados em suportes ou condutos abertos (bandeja, prateleira, tela ou leito) dispostos no espaço de construção' },
  { id: '22', ref: 'B2', vde: 20, conduto: 'circ', tipos: ['isolado'], cena: 'espaco', cont: 'trio', tubo: 'circ', desc: 'Condutores isolados em eletroduto de seção circular em espaço de construção' },
  { id: '23', ref: 'B2', conduto: 'circ', tipos: ['unipolar', 'multipolar'], cena: 'espaco', cont: 'multi', tubo: 'circ', desc: 'Cabos unipolares ou cabo multipolar em eletroduto de seção circular em espaço de construção' },
  { id: '24', ref: 'B2', vde: 20, conduto: 'ncirc', tipos: ['isolado'], cena: 'espaco', cont: 'trio', tubo: 'rect', desc: 'Condutores isolados em eletroduto de seção não-circular ou eletrocalha em espaço de construção' },
  { id: '25', ref: 'B2', conduto: 'ncirc', tipos: ['unipolar', 'multipolar'], cena: 'espaco', cont: 'multi', tubo: 'rect', desc: 'Cabos unipolares ou cabo multipolar em eletroduto de seção não-circular ou eletrocalha em espaço de construção' },
  { id: '26', ref: 'B2', vde: 5, conduto: 'ncirc', tipos: ['isolado'], cena: 'alvenaria', cont: 'trio', tubo: 'rect', desc: 'Condutores isolados em eletroduto de seção não-circular embutido em alvenaria' },
  { id: '27', ref: 'B2', conduto: 'ncirc', tipos: ['unipolar', 'multipolar'], cena: 'alvenaria', cont: 'multi', tubo: 'rect', desc: 'Cabos unipolares ou cabo multipolar em eletroduto de seção não-circular embutido em alvenaria' },
  { id: '28', ref: 'B2', vde: 5, conduto: null, tipos: ['unipolar', 'multipolar'], cena: 'forro', cont: 'cabos', desc: 'Cabos unipolares ou cabo multipolar em forro falso ou em piso elevado' },
  { id: '31', ref: 'B1', conduto: 'ncirc', tipos: ['isolado', 'unipolar'], cena: 'calhaH', cont: 'trio', desc: 'Condutores isolados ou cabos unipolares em eletrocalha sobre parede, em percurso horizontal' },
  { id: '31A', ref: 'B2', conduto: 'ncirc', tipos: ['multipolar'], cena: 'calhaH', cont: 'multi', desc: 'Cabo multipolar em eletrocalha sobre parede, em percurso horizontal' },
  { id: '32', ref: 'B1', conduto: 'ncirc', tipos: ['isolado', 'unipolar'], cena: 'calhaV', cont: 'trio', desc: 'Condutores isolados ou cabos unipolares em eletrocalha sobre parede, em percurso vertical' },
  { id: '32A', ref: 'B2', conduto: 'ncirc', tipos: ['multipolar'], cena: 'calhaV', cont: 'multi', desc: 'Cabo multipolar em eletrocalha sobre parede, em percurso vertical' },
  { id: '33', ref: 'B1', conduto: 'ncirc', tipos: ['isolado', 'unipolar'], cena: 'piso', cont: 'trio', desc: 'Condutores isolados ou cabos unipolares em canaleta fechada embutida no piso' },
  { id: '34', ref: 'B2', conduto: 'ncirc', tipos: ['multipolar'], cena: 'piso', cont: 'multi', desc: 'Cabo multipolar em canaleta fechada embutida no piso' },
  { id: '35', ref: 'B1', conduto: 'ncirc', tipos: ['isolado', 'unipolar'], cena: 'calhaSusp', cont: 'trio', desc: 'Condutores isolados ou cabos unipolares em eletrocalha ou perfilado suspensa(o)' },
  { id: '36', ref: 'B2', conduto: 'ncirc', tipos: ['multipolar'], cena: 'calhaSusp', cont: 'multi', desc: 'Cabo multipolar em eletrocalha ou perfilado suspensa(o)' },
  { id: '41', ref: 'B2', vde: 20, conduto: 'circ', tipos: ['isolado', 'unipolar'], cena: 'piso', cont: 'trio', tubo: 'circ', desc: 'Condutores isolados ou cabos unipolares em eletroduto de seção circular contido em canaleta fechada com percurso horizontal ou vertical' },
  { id: '42', ref: 'B1', conduto: 'circ', tipos: ['isolado'], cena: 'pisoVent', cont: 'trio', tubo: 'circ', desc: 'Condutores isolados em eletroduto de seção circular contido em canaleta ventilada embutida no piso' },
  { id: '43', ref: 'B1', conduto: null, tipos: ['unipolar', 'multipolar'], cena: 'pisoVent', cont: 'cabos', desc: 'Cabos unipolares ou cabo multipolar em canaleta ventilada embutida no piso' },
  { id: '51', ref: 'A1', conduto: null, tipos: ['multipolar'], cena: 'isolante', cont: 'multi', desc: 'Cabo multipolar embutido diretamente em parede termicamente isolante' },
  { id: '52', ref: 'C', conduto: null, tipos: ['unipolar', 'multipolar'], cena: 'alvenaria', cont: 'cabos', desc: 'Cabos unipolares ou cabo multipolar embutido(s) diretamente em alvenaria sem proteção mecânica adicional' },
  { id: '53', ref: 'C', conduto: null, tipos: ['unipolar', 'multipolar'], cena: 'alvenaria', cont: 'cabos', protecao: true, desc: 'Cabos unipolares ou cabo multipolar embutido(s) diretamente em alvenaria com proteção mecânica adicional' },
  { id: '61', ref: 'D', conduto: 'circ', tipos: ['multipolar'], cena: 'solo', cont: 'multi', tubo: 'circ', enterrado: 'duto', desc: 'Cabo multipolar em eletroduto (de seção circular ou não) ou em canaleta não-ventilada enterrado(a)' },
  { id: '61A', ref: 'D', conduto: 'circ', tipos: ['unipolar'], cena: 'solo', cont: 'trio', tubo: 'circ', enterrado: 'duto', desc: 'Cabos unipolares em eletroduto (de seção circular ou não) ou em canaleta não-ventilada enterrado(a)' },
  { id: '63', ref: 'D', conduto: null, tipos: ['unipolar', 'multipolar'], cena: 'solo', cont: 'cabos', protecao: true, enterrado: 'direto', desc: 'Cabos unipolares ou cabo multipolar diretamente enterrado(s), com proteção mecânica adicional' },
  { id: '71', ref: 'A1', conduto: 'ncirc', tipos: ['isolado', 'unipolar'], cena: 'moldura', cont: 'trio', desc: 'Condutores isolados ou cabos unipolares em moldura' },
  { id: '72', ref: 'B1', conduto: 'ncirc', tipos: ['isolado', 'unipolar'], cena: 'rodape', cont: 'trio', desc: 'Condutores isolados ou cabos unipolares em canaleta provida de separações sobre parede' },
  { id: '72A', ref: 'B2', conduto: 'ncirc', tipos: ['multipolar'], cena: 'rodape', cont: 'multi', desc: 'Cabo multipolar em canaleta provida de separações sobre parede' },
  { id: '73', ref: 'A1', conduto: null, condIso: 'circ', tipos: ['isolado', 'unipolar', 'multipolar'], cena: 'porta', cont: 'trio', desc: 'Condutores isolados em eletroduto, cabos unipolares ou cabo multipolar embutido(s) em caixilho de porta' },
  { id: '74', ref: 'A1', conduto: null, condIso: 'circ', tipos: ['isolado', 'unipolar', 'multipolar'], cena: 'janela', cont: 'trio', desc: 'Condutores isolados em eletroduto, cabos unipolares ou cabo multipolar embutido(s) em caixilho de janela' },
  { id: '75', ref: 'B1', conduto: 'ncirc', tipos: ['isolado', 'unipolar'], cena: 'canaletaParede', cont: 'trio', desc: 'Condutores isolados ou cabos unipolares em canaleta embutida em parede' },
  { id: '75A', ref: 'B2', conduto: 'ncirc', tipos: ['multipolar'], cena: 'canaletaParede', cont: 'multi', desc: 'Cabo multipolar em canaleta embutida em parede' }
];
const MET = Object.fromEntries(METODOS.map(m => [m.id, m]));
const MET_PAR = { '1': '2', '2': '1', '3': '4', '4': '3', '5': '6', '6': '5', '7': '8', '8': '7', '22': '23', '24': '25', '26': '27', '31': '31A', '31A': '31', '32': '32A', '32A': '32', '33': '34', '34': '33', '35': '36', '36': '35', '42': '43', '51': '2', '61': '61A', '61A': '61', '72': '72A', '72A': '72', '75': '75A', '75A': '75' };
const condutoDe = (m, tipoCabo) => m.conduto || (tipoCabo === 'isolado' ? (m.condIso || null) : null);

/* Dispositivos de proteção */
const DISP = {
  disj_60898: { nome: 'Disjuntor termomagnético', norma: 'ABNT NBR NM 60898', lista: [2, 4, 6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125], I2: () => 1.45 },
  disj_60947: { nome: 'Disjuntor em caixa moldada', norma: 'ABNT NBR IEC 60947-2', lista: [16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 320, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3200], I2: () => 1.30 },
  fus_gG: { nome: 'Fusível gG', norma: 'ABNT NBR IEC 60269', lista: [2, 4, 6, 10, 16, 20, 25, 32, 35, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 355, 400, 500, 630, 800, 1000, 1250], I2: In => In <= 4 ? 2.1 : (In < 16 ? 1.9 : 1.6) }
};
const CURVA_MAG = { B: [3, 5], C: [5, 10], D: [10, 20] };
const DR_LISTA = [25, 40, 63, 80, 100, 125];
const CL3 = { a: { 3: 15000, 4.5: 25000, 6: 35000, 10: 70000 }, b: { 3: 18000, 4.5: 32000, 6: 45000, 10: 90000 } };

/* Diâmetros externos típicos (mm) — ajustáveis no catálogo do projeto */
const DIAM = {
  isolado: { 0.5: 2.1, 0.75: 2.3, 1: 2.5, 1.5: 3.0, 2.5: 3.6, 4: 4.2, 6: 4.8, 10: 6.1, 16: 7.4, 25: 9.1, 35: 10.5, 50: 12.4, 70: 14.4, 95: 16.4, 120: 18.6, 150: 20.6, 185: 23.0, 240: 26.2, 300: 29.2, 400: 33.0, 500: 37.0 },
  unipolar: { 0.5: 4.6, 0.75: 4.8, 1: 5.0, 1.5: 5.4, 2.5: 5.9, 4: 6.5, 6: 7.1, 10: 8.3, 16: 9.5, 25: 11.3, 35: 12.6, 50: 14.6, 70: 16.6, 95: 18.8, 120: 20.8, 150: 23.2, 185: 25.8, 240: 29.3, 300: 32.5, 400: 36.5, 500: 40.5, 630: 45.5, 800: 51.0, 1000: 56.5 },
  multipolar: {
    2: { 0.5: 6.6, 0.75: 7.0, 1: 7.4, 1.5: 8.9, 2.5: 9.9, 4: 11.0, 6: 12.2, 10: 14.6, 16: 16.8, 25: 20.4, 35: 22.8, 50: 26.4, 70: 30.4, 95: 34.8, 120: 38.4, 150: 42.8, 185: 47.6, 240: 53.6, 300: 59.6 },
    3: { 0.5: 7.0, 0.75: 7.4, 1: 7.8, 1.5: 9.4, 2.5: 10.5, 4: 11.7, 6: 13.0, 10: 15.6, 16: 18.0, 25: 21.8, 35: 24.6, 50: 28.4, 70: 32.6, 95: 37.6, 120: 41.6, 150: 46.2, 185: 51.4, 240: 58.4, 300: 64.8 },
    4: { 0.5: 7.6, 0.75: 8.0, 1: 8.5, 1.5: 10.2, 2.5: 11.4, 4: 12.8, 6: 14.2, 10: 17.0, 16: 19.7, 25: 24.0, 35: 27.0, 50: 31.4, 70: 36.2, 95: 41.6, 120: 46.0, 150: 51.2, 185: 57.0, 240: 64.6, 300: 71.8 },
    5: { 0.5: 8.3, 0.75: 8.8, 1: 9.3, 1.5: 11.1, 2.5: 12.4, 4: 14.0, 6: 15.5, 10: 18.5, 16: 21.5, 25: 26.2, 35: 29.4, 50: 34.2, 70: 39.5, 95: 45.3, 120: 50.1, 150: 55.8, 185: 62.1, 240: 70.4, 300: 78.3 }
  }
};
const POL_ORDEM = ['3/8"', '1/2"', '3/4"', '1"', '1 1/4"', '1 1/2"', '2"', '2 1/2"', '3"', '3 1/2"', '4"', '5"', '6"'];
const ELETRODUTOS = {
  pvc_rigido: { nome: 'PVC rígido roscável', norma: 'ABNT NBR 15465', ferro: false, itens: [
    { dn: '20', pol: '1/2"', di: 16.1 }, { dn: '25', pol: '3/4"', di: 21.0 }, { dn: '32', pol: '1"', di: 26.8 },
    { dn: '40', pol: '1 1/4"', di: 35.0 }, { dn: '50', pol: '1 1/2"', di: 39.8 }, { dn: '60', pol: '2"', di: 50.2 },
    { dn: '75', pol: '2 1/2"', di: 64.1 }, { dn: '85', pol: '3"', di: 75.6 }, { dn: '110', pol: '4"', di: 99.0 }] },
  pvc_flex: { nome: 'PVC flexível corrugado', norma: 'ABNT NBR 15465', ferro: false, itens: [
    { dn: '16', pol: '3/8"', di: 10.7 }, { dn: '20', pol: '1/2"', di: 14.1 }, { dn: '25', pol: '3/4"', di: 18.3 }, { dn: '32', pol: '1"', di: 24.3 }] },
  pead: { nome: 'PEAD corrugado (enterrado)', norma: 'ABNT NBR 15715', ferro: false, itens: [
    { dn: '30', pol: '1 1/4"', di: 30.0 }, { dn: '40', pol: '1 1/2"', di: 39.0 }, { dn: '50', pol: '2"', di: 50.0 }, { dn: '75', pol: '3"', di: 75.0 },
    { dn: '100', pol: '4"', di: 100.0 }, { dn: '125', pol: '5"', di: 125.0 }, { dn: '150', pol: '6"', di: 150.0 }] },
  aco: { nome: 'Aço-carbono galvanizado', norma: 'ABNT NBR 5598', ferro: true, itens: [
    { dn: '15', pol: '1/2"', di: 16.8 }, { dn: '20', pol: '3/4"', di: 22.4 }, { dn: '25', pol: '1"', di: 28.4 },
    { dn: '32', pol: '1 1/4"', di: 36.4 }, { dn: '40', pol: '1 1/2"', di: 42.3 }, { dn: '50', pol: '2"', di: 53.6 },
    { dn: '65', pol: '2 1/2"', di: 69.4 }, { dn: '80', pol: '3"', di: 81.4 }, { dn: '90', pol: '3 1/2"', di: 93.6 }, { dn: '100', pol: '4"', di: 105.8 }] }
};

const TIPOS = { ilum: 'Iluminação', tug: 'Tomadas de uso geral (TUG)', tue: 'Tomada / ponto de uso específico (TUE)', motor: 'Motor', controle: 'Sinalização e controle', dist: 'Distribuição (alimentador de quadro)' };
const LOCAIS = {
  seco: 'Sala, quarto, circulação, escritório (área seca)',
  banheiro: 'Local contendo banheira ou chuveiro',
  cozinha: 'Cozinha ou copa-cozinha',
  servico: 'Área de serviço ou lavanderia',
  garagem: 'Garagem',
  molhada: 'Outra dependência interna molhada ou sujeita a lavagem',
  externa: 'Área externa à edificação',
  internoExt: 'Área interna, com tomada que pode alimentar equipamento no exterior',
  quadro: 'Quadro de distribuição / prumada'
};
const LIG = { FN: 'F+N', FF: 'F+F', FFN: 'F+F+N', FFF: 'F+F+F', FFFN: 'F+F+F+N' };
const LIG_LONGO = { FN: 'monofásico fase-neutro', FF: 'fase-fase, sem neutro', FFN: 'duas fases com neutro', FFF: 'trifásico sem neutro', FFFN: 'trifásico com neutro' };
/* esquemas de ligação oferecidos: condutores vivos + condutor de proteção */
const ESQUEMAS = [['FN', false], ['FN', true], ['FF', false], ['FF', true], ['FFN', true], ['FFF', false], ['FFF', true], ['FFFN', true]];
const esquemaVal = (lig, pe) => lig + (pe ? '+PE' : '');
const esquemaTxt = (lig, pe) => LIG[lig] + (pe ? '+PE' : '');
const TIPO_CABO = { isolado: 'condutor isolado 450/750 V', unipolar: 'cabo unipolar 0,6/1 kV', multipolar: 'cabo multipolar 0,6/1 kV' };
const MATERIAL = { Cu: 'cobre', Al: 'alumínio' };
const EDIFICACAO = { residencial: 'Residencial (local de habitação)', comercial: 'Comercial / serviços', industrial: 'Industrial', publica: 'Local de afluência de público (BD4)' };
function normaCabo(tipo, isol) {
  if (tipo === 'isolado') return isol === 'LSHF' ? 'ABNT NBR 13248' : (isol === 'PVC' ? 'ABNT NBR NM 247-3' : 'ABNT NBR 13248');
  return { PVC: 'ABNT NBR 7288', LSHF: 'ABNT NBR 13248', EPR: 'ABNT NBR 7286', XLPE: 'ABNT NBR 7287' }[isol];
}
