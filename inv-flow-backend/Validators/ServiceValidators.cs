using FluentValidation;
using inv_flow_backend.DTOs;

namespace inv_flow_backend.Validators;

public class CreateServiceDtoValidator : AbstractValidator<CreateServiceDto>
{
    public CreateServiceDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Service name is required")
            .MaximumLength(200).WithMessage("Service name must not exceed 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters");

        RuleFor(x => x.Charge)
            .GreaterThanOrEqualTo(0).WithMessage("Charge must be greater than or equal to 0");

        RuleFor(x => x.VatIncluded)
            .GreaterThanOrEqualTo(0).WithMessage("VAT included amount must be greater than or equal to 0");
    }
}

public class UpdateServiceDtoValidator : AbstractValidator<UpdateServiceDto>
{
    public UpdateServiceDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Service name is required")
            .MaximumLength(200).WithMessage("Service name must not exceed 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters");

        RuleFor(x => x.Charge)
            .GreaterThanOrEqualTo(0).WithMessage("Charge must be greater than or equal to 0");

        RuleFor(x => x.VatIncluded)
            .GreaterThanOrEqualTo(0).WithMessage("VAT included amount must be greater than or equal to 0");
    }
}

