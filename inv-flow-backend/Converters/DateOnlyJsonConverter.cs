using System.Text.Json;
using System.Text.Json.Serialization;

namespace inv_flow_backend.Converters;

public class DateOnlyJsonConverter : JsonConverter<DateOnly>
{
    public override DateOnly Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var value = reader.GetString();
        if (string.IsNullOrEmpty(value))
            return default;
        
        if (DateOnly.TryParse(value, out var date))
            return date;
        
        // Try parsing as DateTime and extract date
        if (DateTime.TryParse(value, out var dateTime))
            return DateOnly.FromDateTime(dateTime);
        
        return default;
    }

    public override void Write(Utf8JsonWriter writer, DateOnly value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString("yyyy-MM-dd"));
    }
}

public class NullableDateOnlyJsonConverter : JsonConverter<DateOnly?>
{
    public override DateOnly? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Null)
            return null;
        
        var value = reader.GetString();
        if (string.IsNullOrEmpty(value))
            return null;
        
        if (DateOnly.TryParse(value, out var date))
            return date;
        
        // Try parsing as DateTime and extract date
        if (DateTime.TryParse(value, out var dateTime))
            return DateOnly.FromDateTime(dateTime);
        
        return null;
    }

    public override void Write(Utf8JsonWriter writer, DateOnly? value, JsonSerializerOptions options)
    {
        if (value.HasValue)
            writer.WriteStringValue(value.Value.ToString("yyyy-MM-dd"));
        else
            writer.WriteNullValue();
    }
}

