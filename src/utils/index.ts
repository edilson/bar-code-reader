export function transformDigitableLineInCodeBar(digitableLine: string): string {
  let barCode = '';

  const firstNumberOfDigitableLine = digitableLine[0];

  if (firstNumberOfDigitableLine !== '8') {
    const digitableLineFieldOne = digitableLine.slice(0, 10);
    const digitableLineFieldTwo = digitableLine.slice(10, 21);
    const digitableLineFieldThree = digitableLine.slice(21, 32);
    const digitableLineFieldFour = digitableLine[32];
    const digitableLineFieldFive = digitableLine.slice(33, 47);

    const destinationFiCode = digitableLineFieldOne.slice(0, 3);
    const currencyCode = digitableLineFieldOne.slice(3, 4);
    const verifyDigit = digitableLineFieldFour;
    const expirationFactor = digitableLineFieldFive.slice(0, 4);
    const amount = digitableLineFieldFive.slice(4, 14);
    const freeField = `${digitableLineFieldOne.slice(
      4,
      9
    )}${digitableLineFieldTwo.slice(0, 10)}${digitableLineFieldThree.slice(
      0,
      10
    )}`;

    barCode = `${destinationFiCode}${currencyCode}${verifyDigit}${expirationFactor}${amount}${freeField}`;
  } else {
    const firstSegment = digitableLine.slice(0, 12);
    const secondSegment = digitableLine.slice(12, 24);
    const thirdSegment = digitableLine.slice(24, 36);
    const fourthSegment = digitableLine.slice(36, 49);

    const productIdentification = digitableLine[0];
    const segmentIdentification = digitableLine[1];
    const valueCalculationReference = digitableLine[2];
    const amount = `${firstSegment.slice(4, 11)}${secondSegment.slice(0, 4)}`;
    const companyIdentifier = `${secondSegment.slice(4, 8)}`;
    const freeField = `${secondSegment.slice(7, 12)}${thirdSegment.slice(
      0,
      11
    )}${fourthSegment.slice(0, 11)}`;

    const moduleUsedToCalculateVD =
      checkModuleAndIfItIsAnEffectiveValueIdentifier(
        valueCalculationReference
      ) as Record<string, any>;

    const barCodeWithoutVD = `${productIdentification}${segmentIdentification}${valueCalculationReference}${amount}${companyIdentifier}${freeField}`;

    const verifyDigit = calculateBasedOnRespectiveModule(
      barCodeWithoutVD,
      moduleUsedToCalculateVD.module
    );

    barCode = `${productIdentification}${segmentIdentification}${valueCalculationReference}${verifyDigit}${amount}${companyIdentifier}${freeField}`;
  }

  return barCode;
}

function checkModuleAndIfItIsAnEffectiveValueIdentifier(
  effectiveValueIdentifier: string
): Record<string, any> | undefined {
  switch (effectiveValueIdentifier) {
    case '6': {
      return {
        module: '10',
        isEffective: true,
      };
    }
    case '7': {
      return {
        module: '10',
        isEffective: false,
      };
    }
    case '8': {
      return {
        module: '11',
        isEffective: true,
      };
    }
    case '9': {
      return {
        module: '11',
        isEffective: false,
      };
    }
    default: {
      break;
    }
  }
}

function calculateBasedOnRespectiveModule(
  digitableLineWithoutVerifyingDigit: string,
  moduleUsed: string
): number {
  let verifyingDigitSum = 0;

  let module10InitialWeight = 2;
  let currentModule11WeigthUsed = 2;
  const highestWeight = 9;

  for (
    let digitableLineWithoutVerifyingDigitIndex =
      digitableLineWithoutVerifyingDigit.length - 1;
    digitableLineWithoutVerifyingDigitIndex >= 0;
    digitableLineWithoutVerifyingDigitIndex--
  ) {
    if (moduleUsed === '10') {
      let weightAndDigitSum =
        module10InitialWeight *
        parseInt(
          digitableLineWithoutVerifyingDigit[
            digitableLineWithoutVerifyingDigitIndex
          ]
        );

      if (weightAndDigitSum >= 10) {
        const weightAndDigitSumToString = weightAndDigitSum.toString();

        weightAndDigitSum = 0;

        for (
          let weightAndDigitSumToStringIndex = 0;
          weightAndDigitSumToStringIndex < weightAndDigitSumToString.length;
          weightAndDigitSumToStringIndex++
        ) {
          weightAndDigitSum += parseInt(
            weightAndDigitSumToString[weightAndDigitSumToStringIndex]
          );
        }
      }

      verifyingDigitSum += weightAndDigitSum;

      if (module10InitialWeight === 2) {
        module10InitialWeight = 1;
      } else if (module10InitialWeight === 1) {
        module10InitialWeight = 2;
      }
    } else if (moduleUsed === '11') {
      verifyingDigitSum +=
        currentModule11WeigthUsed *
        parseInt(
          digitableLineWithoutVerifyingDigit[
            digitableLineWithoutVerifyingDigitIndex
          ]
        );

      if (currentModule11WeigthUsed < highestWeight) {
        currentModule11WeigthUsed++;
      } else if (currentModule11WeigthUsed === 9) {
        currentModule11WeigthUsed = 2;
      }
    }
  }

  let verifyDigit = 0;

  if (moduleUsed === '10') {
    const verifyDigitRemainder = verifyingDigitSum % 10;

    verifyDigit = 10 - verifyDigitRemainder;
  } else if (moduleUsed === '11') {
    const verifyDigitRemainder = verifyingDigitSum % 11;

    if (verifyDigitRemainder == 0 || verifyDigitRemainder == 1) {
      verifyDigit = 0;
    } else if (verifyDigitRemainder == 10) {
      verifyDigit = 1;
    } else {
      verifyDigit = 11 - verifyDigitRemainder;
    }
  }

  return verifyDigit;
}
