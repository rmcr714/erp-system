import type { Laborer } from '../types/laborer';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

const EXTRACTION_PROMPT = `
You are an expert data extraction AI for Indian labor registration forms. 
Carefully analyze every part of the image and extract all readable fields.

STRICT RULES:
- Return ONLY valid JSON. No markdown, no explanation, no code fences.
- Omit any field you cannot clearly read — do NOT guess.
- Use the printed label names on the form to map fields exactly:
  - Employer Name -> employerName
  - Site Address / Active Project Site -> siteAddress
  - Contact No / Contact Number -> contactNo
  - Date of Birth -> dateOfBirth
  - Date of joining -> dateOfJoining
  - Permanent Address -> permanentAddress
- If the form shows separate Employer Name and Site Address values, assign them to employerName and siteAddress respectively. Do not merge the project site into employerName.
- If the employer name is a short industry label like "Civil" and the next text is a project location such as "Ajmera Manhattan", keep employerName="Civil" and siteAddress="Ajmera Manhattan".
- For dates: the form uses DD/MM/YYYY or DD/MM/YY format. Convert ALL dates to YYYY-MM-DD. Example: "05/03/1990" → "1990-03-05", "15/04/26" → "2026-04-15".
- For designation: if the form says "Labour", "Labor", or "Labourer" map it to "Unskilled". Other valid values: "Carpenter", "Steel fitter", "Block mason", "Plaster mason", "Other".
- For permanent address: the form often writes city, state and pincode on a single line (e.g. "Raigarh, Chhattisgarh, 496450"). Parse them into separate fields: line = city/village/street, state = full state name, pincode = 6-digit number.
- For height: if written as decimal feet (e.g. "5.7 Ft"), convert to feet-inches format (e.g. "5'7\\""). Convert by multiplying the decimal part by 12.
- For identity proof: look for which type is circled, ticked, or written. Map to "AADHAR", "PAN", or "ELECTION".
- For PF: look for YES/NO written, a checkbox, or a tick. Set hasPf to true only if YES is clearly indicated.
- For contact number: strip any spaces or dashes. Include as-is without country code prefix.
- Include grNo if a GR No or GR Number field is visible and filled.

Return this exact JSON structure (omit any key where the value is not readable):
{
  "grNo": "string",
  "fullName": "string",
  "designation": "Carpenter | Steel fitter | Block mason | Plaster mason | Unskilled | Other",
  "designationDetail": "string (only if designation is Other)",
  "employerName": "string",
  "siteAddress": "string",
  "contactNo": "string",
  "dateOfBirth": "YYYY-MM-DD",
  "dateOfJoining": "YYYY-MM-DD",
  "height": "string in feet-inches format e.g. 5'7\\"",
  "weight": "string e.g. 87kg",
  "bloodGroup": "string e.g. O+",
  "joinByReference": "string",
  "hasPf": true | false,
  "pfNo": "string",
  "permanentAddress": {
    "line": "city/village/street",
    "state": "full Indian state name",
    "pincode": "6-digit string"
  },
  "idProof": {
    "type": "AADHAR | PAN | ELECTION",
    "idNumber": "string"
  },
  "bankDetails": {
    "bankName": "string",
    "branch": "string",
    "accountNo": "string",
    "ifscCode": "string"
  }
}
`;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Strip data:image/...;base64, prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function scanLaborForm(imageFile: File): Promise<Partial<Laborer>> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Groq API key not found. Please add VITE_GROQ_API_KEY to your .env.local file.');
  }

  const base64Image = await fileToBase64(imageFile);
  const mimeType = imageFile.type || 'image/jpeg';

  const requestBody = {
    model: GROQ_MODEL,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: EXTRACTION_PROMPT,
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
            },
          },
        ],
      },
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' },
  };

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody?.error?.message || `API error ${response.status}`;
    throw new Error(`Groq API Error: ${message}`);
  }

  const data = await response.json();
  const rawText = data?.choices?.[0]?.message?.content;

  if (!rawText) {
    throw new Error('No data was returned from the AI. Please try a clearer image.');
  }

  let parsed: Partial<Laborer>;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error('AI returned an unexpected format. Please try again.');
  }

  return parsed;
}

/** Counts how many top-level and nested fields were extracted */
export function countExtractedFields(data: Partial<Laborer>): number {
  let count = 0;
  const nested = ['permanentAddress', 'idProof', 'bankDetails'];
  for (const [key, value] of Object.entries(data)) {
    if (nested.includes(key) && typeof value === 'object' && value !== null) {
      count += Object.values(value).filter((v) => v !== '' && v !== null && v !== undefined).length;
    } else if (value !== '' && value !== null && value !== undefined) {
      count++;
    }
  }
  return count;
}
