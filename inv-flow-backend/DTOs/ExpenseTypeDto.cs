namespace inv_flow_backend.DTOs;

public class ExpenseTypeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal DefaultValue { get; set; }
}

public class CreateExpenseTypeDto
{
    public string Name { get; set; } = string.Empty;
    public decimal DefaultValue { get; set; }
}

public class UpdateExpenseTypeDto
{
    public string Name { get; set; } = string.Empty;
    public decimal DefaultValue { get; set; }
}

