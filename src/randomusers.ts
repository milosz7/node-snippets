import { writeFile } from 'fs';

interface PersonData {
  gender: 'M' | 'F';
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  number: string;
}

const userInput = parseInt(process.argv[2]);
if (!userInput) {
  console.log('Passed argument is invalid - generating data for 20 people (default)');
}

const defaultGenerationQuantity = 20;
const minRandomAge = 18;
const possibleAgesNumber = 61;

const output: PersonData[] = [];

const maleFirstNames = ['John', 'Mike', 'Michael', 'Adalbert', 'Peter'];
const femaleFirstNames = ['Ann', 'Jane', 'Andrea', 'Sandra', 'Lois'];

const lastNames = ['Doe', 'Griffin', 'Simpson', 'Brown', 'White', 'Bush'];

const generateGender = (): 'M' | 'F' => {
  const randomNumber = Math.random();
  return randomNumber > 0.5 ? 'M' : 'F';
};

const generatePhoneNumber = () => {
  const numberPrefix = '+48';
  let numberCore = '';
  const possibleFirstDigits = [5, 6, 7, 8];
  const randomFirstDigit =
    possibleFirstDigits[Math.floor(Math.random() * possibleFirstDigits.length)];
  numberCore += randomFirstDigit.toString();
  for (let i = 0; i < 8; i++) {
    const randomDigit = Math.floor(Math.random() * 10);
    numberCore += randomDigit.toString();
  }
  return numberPrefix + numberCore;
};

const amountToGenerate =
  typeof userInput === 'number' && userInput ? userInput : defaultGenerationQuantity;

for (let i = 0; i < amountToGenerate; i++) {
  const gender = generateGender();
  const phoneNumber = generatePhoneNumber();
  const randomFirstNameIdx = Math.floor(
    Math.random() * (gender === 'M' ? maleFirstNames.length : femaleFirstNames.length)
  );
  const randomFirstName =
    gender === 'M' ? maleFirstNames[randomFirstNameIdx] : femaleFirstNames[randomFirstNameIdx];
  const randomSecondName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const age = Math.floor(Math.random() * possibleAgesNumber + minRandomAge);
  const identity = {
    gender: gender,
    firstName: randomFirstName,
    lastName: randomSecondName,
    age: age,
    email: `${randomFirstName.toLowerCase()}.${randomSecondName.toLowerCase()}@example.com`,
    number: phoneNumber,
  };
  output.push(identity);
}

writeFile('people.json', JSON.stringify(output, null, 2), (err) => {
  if (err) throw err;
  console.log('File saved');
});
