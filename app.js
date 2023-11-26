const fs = require('fs');
const { DateTime } = require('luxon');

function readDataFromFile(filePath) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
}

function generateCompletionCounts(data) {
    const completionCounts = {};

  for (const person of data) {
    let completionCourses = [];
        for (const completion of person.completions) {
          const name = completion.name;
          if (!completionCourses.includes(name)) {
            completionCounts[name] = (completionCounts[name] || 0) + 1;
            completionCourses.push(name);
          } 
        }
    }

    return completionCounts;
}

function generatePeopleForTrainingsInFiscalYear(data, trainings, fiscalYearStart, fiscalYearEnd) {
    const result = {};

    for (const training of trainings) {
        result[training] = [];
        for (const person of data) {
            for (const completion of person.completions) {
                if (completion.name === training) {
                    const completionDate = DateTime.fromFormat(completion.timestamp, 'M/d/yyyy');
                    if (completionDate >= DateTime.fromFormat(fiscalYearStart, 'M/d/yyyy') &&
                      completionDate <= DateTime.fromFormat(fiscalYearEnd, 'M/d/yyyy') &&
                        !result[training].includes[person.name]) {
                        result[training].push(person.name);
                    }
                }
            }
        }
    }

    return result;
}

function generateExpiredTrainings(data, referenceDate) {
    const referenceDateTime = DateTime.fromFormat(referenceDate, 'M/d/yyyy');
    const result = {};

    for (const person of data) {
        for (const completion of person.completions) {
            const completionDate = DateTime.fromFormat(completion.timestamp, 'M/d/yyyy');
            const expirationDate = completion.expires ? DateTime.fromFormat(completion.expires, 'M/d/yyyy') : null;

            if (expirationDate || (expirationDate <= referenceDateTime.plus({ days: 30 }))) {
                result[person.name] = result[person.name] || [];
                result[person.name].push({
                    training_name: completion.name,
                    expired: completionDate < expirationDate ? "expired":"expired soon",
                });
            }
        }
    }

    return result;
}

if (require.main === module) {
    const filePath = 'trainings.txt';
    const data = readDataFromFile(filePath);

    // Task 1
    const completionCounts = generateCompletionCounts(data);
    fs.writeFileSync('completion_counts.json', JSON.stringify(completionCounts, null, 2));

    // Task 2
    const fiscalYearStart = '07/01/2023';
    const fiscalYearEnd = '06/30/2024';
    const trainingsForFiscalYear = ['Electrical Safety for Labs', 'X-Ray Safety', 'Laboratory Safety Training'];
    const peopleForTrainings = generatePeopleForTrainingsInFiscalYear(data, trainingsForFiscalYear, fiscalYearStart, fiscalYearEnd);
    fs.writeFileSync('people_for_trainings.json', JSON.stringify(peopleForTrainings, null, 2));

    // Task 3
    const referenceDate = '10/01/2023';
    const expiredTrainings = generateExpiredTrainings(data, referenceDate);
    fs.writeFileSync('expired_trainings.json', JSON.stringify(expiredTrainings, null, 2));
}
