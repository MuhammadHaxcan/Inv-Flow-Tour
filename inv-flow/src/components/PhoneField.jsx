import React, { useState, useEffect } from 'react';
import PhoneInput from 'react-phone-number-input/input';
import { parsePhoneNumberFromString, isValidPhoneNumber } from 'libphonenumber-js';
import 'react-phone-number-input/style.css';

const COUNTRY_NAMES = {
    AE: 'United Arab Emirates',
    SA: 'Saudi Arabia',
    IN: 'India',
    PK: 'Pakistan',
    US: 'United States',
    GB: 'United Kingdom'
};

const PhoneField = ({
    value,
    onChange,
    onCountryChange,
    required = false,
    label = 'Phone',
    error: externalError
}) => {
    const [error, setError] = useState('');

    useEffect(() => {
        setError(externalError || '');
    }, [externalError]);

    const handleChange = (val) => {
        const phoneVal = val || '';
        onChange?.(phoneVal);

        const parsed = phoneVal ? parsePhoneNumberFromString(phoneVal) : null;
        const countryCode = parsed?.country;
        if (countryCode && onCountryChange) {
            const countryName = COUNTRY_NAMES[countryCode] || countryCode;
            onCountryChange(countryName);
        }

        if (!phoneVal) {
            setError(required ? 'Phone number is required' : '');
            return;
        }

        if (!isValidPhoneNumber(phoneVal)) {
            const countryName = countryCode ? (COUNTRY_NAMES[countryCode] || countryCode) : 'selected country';
            setError(`Enter a valid phone number for ${countryName}`);
        } else {
            setError('');
        }
    };

    return (
        <div>
            <label className="form-label small fw-medium">{label}</label>
            <PhoneInput
                international
                defaultCountry="AE"
                value={value}
                onChange={handleChange}
                required={required}
                className={`form-control form-control-sm ${error ? 'is-invalid' : ''}`}
                placeholder="Enter phone with country code"
            />
            {error && <div className="invalid-feedback d-block">{error}</div>}
        </div>
    );
};

export default PhoneField;

