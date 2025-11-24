using FluentValidation;
using inv_flow_backend.DTOs;

namespace inv_flow_backend.Validators;

public class CreateExpenseTypeDtoValidator : AbstractValidator<CreateExpenseTypeDto>
{
    public CreateExpenseTypeDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Expense type name is required")
            .MaximumLength(200).WithMessage("Expense type name must not exceed 200 characters");

        RuleFor(x => x.DefaultValue)
            .GreaterThanOrEqualTo(0).WithMessage("Default value must be greater than or equal to 0");
    }
}

public class UpdateExpenseTypeDtoValidator : AbstractValidator<UpdateExpenseTypeDto>
{
    public UpdateExpenseTypeDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Expense type name is required")
            .MaximumLength(200).WithMessage("Expense type name must not exceed 200 characters");

        RuleFor(x => x.DefaultValue)
            .GreaterThanOrEqualTo(0).WithMessage("Default value must be greater than or equal to 0");
    }
}

