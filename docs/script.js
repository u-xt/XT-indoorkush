let weeks = [{}];

const fieldDefinitions = [
  { key: 'RecRH', label: 'RecRH', description: 'Recommended Relative Humidity', icon: 'droplets' },
  { key: 'MinRH', label: 'MinRH', description: 'Minimum Relative Humidity', icon: 'droplets' },
  { key: 'MaxRH', label: 'MaxRH', description: 'Maximum Relative Humidity', icon: 'droplets' },
  { key: 'RecTMP', label: 'RecTMP', description: 'Recommended Temperature', icon: 'thermometer' },
  { key: 'MiAT', label: 'MiAT', description: 'Minimum Air Temperature', icon: 'thermometer' },
  { key: 'MAT', label: 'MAT', description: 'Maximum Air Temperature', icon: 'thermometer' },
  { key: 'RecPH', label: 'RecPH', description: 'Recommended pH', icon: 'flask' },
  { key: 'MinPH', label: 'MinPH', description: 'Minimum pH', icon: 'flask' },
  { key: 'MaxPH', label: 'MaxPH', description: 'Maximum pH', icon: 'flask' },
  { key: 'LED_ON_H', label: 'LED_ON_H', description: 'LED Turn On Hour', icon: 'lightbulb' },
  { key: 'LED_OFF_H', label: 'LED_OFF_H', description: 'LED Turn Off Hour', icon: 'lightbulb' }
];

const icons = {
  droplets: '<path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/>',
  thermometer: '<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>',
  flask: '<path d="M7 17v-5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2Z"/><path d="M15 9V6a3 3 0 0 0-6 0v3"/>',
  lightbulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>'
};

function getIconSVG(iconName) {
  return `<svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icons[iconName]}</svg>`;
}

function updateWeekData(weekIndex, field, value) {
  if (value === '' || /^\d*\.?\d*$/.test(value)) {
    if (!weeks[weekIndex]) weeks[weekIndex] = {};
    weeks[weekIndex][field] = value;
  }
}

function renderWeeks() {
  const container = document.getElementById('weeks-container');
  container.innerHTML = '';

  weeks.forEach((week, index) => {
    const weekDiv = document.createElement('div');
    weekDiv.className = 'card';

    let fieldsHTML = '';
    fieldDefinitions.forEach(field => {
      const value = week[field.key] || '';
      fieldsHTML += `
        <div class="field-group">
          <label class="field-label">
            ${getIconSVG(field.icon)} ${field.label}
          </label>
          <p class="field-description">${field.description}</p>
          <input 
            type="text" 
            class="input" 
            value="${value}"
            placeholder="0"
            oninput="updateWeekData(${index}, '${field.key}', this.value); this.value = weeks[${index}]['${field.key}'] || '';"
          />
        </div>`;
    });

    weekDiv.innerHTML = `<h3>Week ${index + 1}</h3><div class="form-grid">${fieldsHTML}</div>`;
    container.appendChild(weekDiv);
  });

  document.getElementById('remove-btn').disabled = weeks.length <= 1;
}

function addWeek() {
  weeks.push({});
  renderWeeks();
}

function removeWeek() {
  if (weeks.length > 1) {
    weeks.pop();
    renderWeeks();
  }
}

function generateConfig() {
  let code = `#ifndef CONFIG_H
#define CONFIG_H

struct Week {
  float RecRH;
  float MinRH;
  float MaxRH;
  float RecTMP;
  float MiAT;
  float MAT;
  float RecPH;
  float MinPH;
  float MaxPH;
  int LED_ON_H;
  int LED_OFF_H;
};

`;

  weeks.forEach((week, index) => {
    const weekNum = index + 1;
    code += `Week week${weekNum} = {
  ${week.RecRH || '0'},
  ${week.MinRH || '0'},
  ${week.MaxRH || '0'},
  ${week.RecTMP || '0'},
  ${week.MiAT || '0'},
  ${week.MAT || '0'},
  ${week.RecPH || '0'},
  ${week.MinPH || '0'},
  ${week.MaxPH || '0'},
  ${week.LED_ON_H || '0'},
  ${week.LED_OFF_H || '0'}
};

`;
  });

  code += `Week weeks[] = {
${weeks.map((_, i) => `  week${i + 1}`).join(',\n')}
};

const int NUM_WEEKS = ${weeks.length};

#endif`;

  document.getElementById('generated-code').value = code;
  document.getElementById('code-section').style.display = 'block';
}

function copyToClipboard(event) {
  const textarea = document.getElementById('generated-code');
  textarea.select();
  document.execCommand('copy');

  const button = event.target;
  const originalText = button.textContent;
  button.textContent = 'Copied!';
  setTimeout(() => (button.textContent = originalText), 2000);
}

renderWeeks();
