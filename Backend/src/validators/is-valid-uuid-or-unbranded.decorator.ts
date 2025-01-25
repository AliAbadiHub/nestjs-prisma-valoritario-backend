import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { validate as isUUID } from 'uuid';

@ValidatorConstraint({ async: false })
export class IsValidUUIDOrUnbrandedConstraint
  implements ValidatorConstraintInterface
{
  validate(value: string | undefined | null): boolean {
    const unbrandedId = '00000000-0000-0000-0000-UNBRANDED00';

    // Allow undefined or null (optional field)
    if (value === undefined || value === null) {
      return true;
    }

    // Validate if it's either a valid UUID or the unbranded placeholder
    return value === unbrandedId || isUUID(value);
  }

  defaultMessage(): string {
    return `The value must be a valid UUID (version 4) or the unbranded placeholder UUID.`;
  }
}

export function IsValidUUIDOrUnbranded(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidUUIDOrUnbrandedConstraint,
    });
  };
}
