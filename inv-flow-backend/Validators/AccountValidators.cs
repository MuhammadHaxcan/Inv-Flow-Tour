using FluentValidation;
using inv_flow_backend.DTOs;

namespace inv_flow_backend.Validators;

public class CreateAccountDtoValidator : AbstractValidator<CreateAccountDto>
{
    public CreateAccountDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Account name is required")
            .MaximumLength(200).WithMessage("Account name must not exceed 200 characters");

        RuleFor(x => x.AccountType)
            .NotEmpty().WithMessage("Account type is required")
            .Must(x => x.ToLower() == "cash" || x.ToLower() == "bank")
            .WithMessage("Account type must be either 'cash' or 'bank'");

        RuleFor(x => x.AccountNumber)
            .MaximumLength(100).WithMessage("Account number must not exceed 100 characters");

        RuleFor(x => x.Details)
            .MaximumLength(500).WithMessage("Details must not exceed 500 characters");
    }
}

public class UpdateAccountDtoValidator : AbstractValidator<UpdateAccountDto>
{
    public UpdateAccountDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Account name is required")
            .MaximumLength(200).WithMessage("Account name must not exceed 200 characters");

        RuleFor(x => x.AccountType)
            .NotEmpty().WithMessage("Account type is required")
            .Must(x => x.ToLower() == "cash" || x.ToLower() == "bank")
            .WithMessage("Account type must be either 'cash' or 'bank'");

        RuleFor(x => x.AccountNumber)
            .MaximumLength(100).WithMessage("Account number must not exceed 100 characters");

        RuleFor(x => x.Details)
            .MaximumLength(500).WithMessage("Details must not exceed 500 characters");
    }
}

