// content.js
(() => {
    // Wait for the page to fully load
    window.addEventListener('load', () => {
      // Check if we're on the right page and the schedule table exists
      const scheduleContainer = document.querySelector('.assessment_schedule-container');
      if (!scheduleContainer) return;
      
      // Create the Generate Schedule button
      const generateButton = document.createElement('button');
      generateButton.textContent = 'Generate Schedule';
      generateButton.className = 'generate-schedule-btn';
      generateButton.addEventListener('click', generateVisualSchedule);
      
      // Insert button after the schedule container
      scheduleContainer.insertAdjacentElement('afterend', generateButton);
    });
  
    // Generate the visual schedule
    function generateVisualSchedule() {
      // Extract schedule data from the table
      const scheduleData = extractScheduleData();
      if (!scheduleData || scheduleData.courses.length === 0) {
        alert('Unable to extract schedule data. Please make sure you are on the correct page.');
        return;
      }
      
      // Create the visual schedule container
      const container = createVisualScheduleContainer(scheduleData);
      
      // Find the assessment schedule container to place the visual schedule after it
      const existingVisualSchedule = document.querySelector('.visual-schedule-container');
      
      if (existingVisualSchedule) {
        existingVisualSchedule.remove();
      }
      
      // Insert the visual schedule after the button
      document.querySelector('.generate-schedule-btn').insertAdjacentElement('afterend', container);
      
      // After rendering, place the subject cells
      setTimeout(() => {
        placeSubjectCells(scheduleData.courses);
      }, 100);
    }
  
    // Extract schedule data from the table
    function extractScheduleData() {
      const tableRows = document.querySelectorAll('.assessment_schedule tbody tr');
      if (!tableRows.length) return null;
      
      const scheduleData = [];
      const sectionInfo = document.querySelector('.assessment_schedule tbody tr td:nth-child(3)');
      let sectionTitle = 'Schedule';
      
      if (sectionInfo) {
        sectionTitle = `${sectionInfo.textContent} - Schedule`;
      }
      
      // Create a map to store subject codes and their assigned colors
      const subjectColorMap = {};
      const colors = getColorPalette();
      let colorIndex = 0;
      
      // Skip the last row which contains the total units
      for (let i = 0; i < tableRows.length - 1; i++) {
        const row = tableRows[i];
        const cells = row.querySelectorAll('td');
        
        if (cells.length < 7) continue;
        
        const subject = cells[0].textContent; // Course code
        const title = cells[1].textContent; // Course title
        const days = cells[4].textContent.split('/').map(day => day.trim()); // Days
        const timesRaw = cells[5].textContent.split('/').map(time => time.trim()); // Times
        const roomsRaw = cells[6].textContent.split('/').map(room => room.trim()); // Rooms
        
        // Check if color already assigned to this subject
        if (!subjectColorMap[subject]) {
          subjectColorMap[subject] = colors[colorIndex % colors.length];
          colorIndex++;
        }
        
        // Process each day-time-room combination
        for (let j = 0; j < days.length; j++) {
          const day = convertDayToFull(days[j]);
          const time = timesRaw[j] || timesRaw[0]; // Use first time if specific time not available
          const room = roomsRaw[j] || roomsRaw[0]; // Use first room if specific room not available
          
          // Parse the start and end times
          const [startTime, endTime] = time.split('-').map(t => parseTime(t.trim()));
          
          scheduleData.push({
            subject,
            title,
            day,
            startTime,
            endTime,
            room,
            color: subjectColorMap[subject] // Use the assigned color for this subject
          });
        }
      }
      
      return {
        courses: scheduleData,
        title: sectionTitle
      };
    }
  
    // Generate a palette of distinct colors for subjects
    function getColorPalette() {
      return [
        '#2196F3', // Blue
        '#9C27B0', // Purple
        '#FF9800', // Orange
        '#F44336', // Red
        '#009688', // Teal
        '#3F51B5', // Indigo
        '#795548', // Brown
        '#607D8B', // Blue Grey
        '#E91E63', // Pink
        '#673AB7', // Deep Purple
        '#FFC107', // Amber
        '#00BCD4', // Cyan
        '#8BC34A', // Light Green
        '#FF5722', // Deep Orange
        '#9E9E9E', // Grey
        '#CDDC39', // Lime
        '#03A9F4', // Light Blue
        '#D32F2F', // Dark Red
        '#7B1FA2', // Dark Purple
        '#1976D2', // Dark Blue
        '#388E3C', // Dark Green
        '#AFB42B', // Dark Lime
        '#0097A7', // Dark Cyan
        '#FFA000', // Dark Amber
        '#5D4037', // Dark Brown
        '#455A64'  // Dark Blue Grey
      ];
    }
  
    // Convert single letter day codes to full day names
    function convertDayToFull(day) {
      const dayMap = {
        'M': 'Monday',
        'T': 'Tuesday',
        'W': 'Wednesday',
        'TH': 'Thursday',
        'F': 'Friday',
        'S': 'Saturday',
        'SU': 'Sunday'
      };
      
      return dayMap[day] || day;
    }
  
    // Parse time string to time object
    function parseTime(timeStr) {
      // Format: HH:MM:SS
      const [hours, minutes, seconds] = timeStr.split(':').map(Number);
      return {
        hours,
        minutes,
        toString: function() {
          let period = this.hours >= 12 ? 'PM' : 'AM';
          let displayHours = this.hours > 12 ? this.hours - 12 : this.hours;
          if (displayHours === 0) displayHours = 12;
          return `${displayHours}:${this.minutes.toString().padStart(2, '0')} ${period}`;
        },
        // Get decimal representation of time (e.g., 9:30 = 9.5)
        decimal: function() {
          return this.hours + (this.minutes / 60);
        }
      };
    }
  
    // Create the visual schedule container and elements
    function createVisualScheduleContainer(scheduleData) {
      const container = document.createElement('div');
      container.className = 'visual-schedule-container';
      
      // Add the title
      const title = document.createElement('h3');
      title.textContent = scheduleData.title;
      title.className = 'schedule-title';
      container.appendChild(title);
      
      // Create toolbar for customization
      const toolbar = createToolbar();
      container.appendChild(toolbar);
      
      // Create the schedule table
      const scheduleTable = createScheduleTable(scheduleData.courses);
      container.appendChild(scheduleTable);
      
      return container;
    }
  
    // Create customization toolbar
    function createToolbar() {
      const toolbar = document.createElement('div');
      toolbar.className = 'schedule-toolbar';
      
      // Theme selector
      const themeSelector = document.createElement('select');
      themeSelector.className = 'theme-selector';
      
      const themes = [
        { value: 'default', text: 'Default Theme' },
        { value: 'dark', text: 'Dark Theme' },
        { value: 'light', text: 'Light Theme' },
        { value: 'blue', text: 'Blue Theme' },
        { value: 'green', text: 'Green Theme' }
      ];
      
      themes.forEach(theme => {
        const option = document.createElement('option');
        option.value = theme.value;
        option.textContent = theme.text;
        themeSelector.appendChild(option);
      });
      
      themeSelector.addEventListener('change', (e) => {
        const schedule = document.querySelector('.visual-schedule');
        // Remove all theme classes
        schedule.classList.remove('theme-default', 'theme-dark', 'theme-light', 'theme-blue', 'theme-green');
        // Add selected theme class
        schedule.classList.add(`theme-${e.target.value}`);
      });
      
      // Color picker for subject cells
      const colorPicker = document.createElement('input');
      colorPicker.type = 'color';
      colorPicker.className = 'subject-color-picker';
      colorPicker.value = '#4caf50';
      
      // Color apply button
      const applyColorBtn = document.createElement('button');
      applyColorBtn.textContent = 'Apply Color to Selected';
      applyColorBtn.className = 'apply-color-btn';
      applyColorBtn.addEventListener('click', () => {
        const selectedCells = document.querySelectorAll('.subject-cell.selected');
        const subjectCode = selectedCells.length > 0 ? selectedCells[0].dataset.subjectCode : null;
        
        // If we have a subject code, apply the color to all cells with that code
        if (subjectCode) {
          document.querySelectorAll(`.subject-cell[data-subject-code="${subjectCode}"]`).forEach(cell => {
            cell.style.backgroundColor = colorPicker.value;
          });
        } else {
          // Otherwise just apply to selected cells
          selectedCells.forEach(cell => {
            cell.style.backgroundColor = colorPicker.value;
          });
        }
      });
      
      // Download button
      const downloadBtn = document.createElement('button');
      downloadBtn.textContent = 'Save as PNG';
      downloadBtn.className = 'download-btn';
      downloadBtn.addEventListener('click', () => {
        const scheduleElement = document.querySelector('.visual-schedule-container');
        if (!scheduleElement) return;
        
        // Use the html2canvas function from the extension's own files
        saveScheduleAsPNG(scheduleElement);
      });
      
      function saveScheduleAsPNG(element) {
        // Create a temporary container with just the title and table
        const tempContainer = document.createElement('div');
        tempContainer.className = 'visual-schedule-container-for-export';
        tempContainer.style.cssText = 'position: fixed; left: -9999px; top: -9999px;';
        
        // Clone the title and table
        const title = element.querySelector('.schedule-title').cloneNode(true);
        const table = element.querySelector('.schedule-table-container').cloneNode(true);
        
        // Add them to the temporary container
        tempContainer.appendChild(title);
        tempContainer.appendChild(table);
        
        // Add to DOM
        document.body.appendChild(tempContainer);
        
        // Use chrome.runtime.sendMessage to communicate with background script
        chrome.runtime.sendMessage(
          { 
            action: "captureScreenshot", 
            elementSelector: ".visual-schedule-container-for-export" 
          },
          (response) => {
            // Remove the temporary container
            document.body.removeChild(tempContainer);
            
            if (response && response.dataUrl) {
              // Create link to download the image
              const link = document.createElement('a');
              link.download = 'schedule.png';
              link.href = response.dataUrl;
              link.click();
            } else {
              console.error("Failed to capture screenshot:", response?.error || "Unknown error");
              alert("Failed to save schedule as PNG. Please try again.");
            }
          }
        );
      }
      
      // Reset button
      const resetBtn = document.createElement('button');
      resetBtn.textContent = 'Reset Colors';
      resetBtn.className = 'reset-btn';
      resetBtn.addEventListener('click', () => {
        // Get all unique subject codes
        const subjectCodes = new Set();
        document.querySelectorAll('.subject-cell').forEach(cell => {
          subjectCodes.add(cell.dataset.subjectCode);
        });
        
        // Recreate color map
        const colors = getColorPalette();
        const subjectColorMap = {};
        let colorIndex = 0;
        
        subjectCodes.forEach(code => {
          subjectColorMap[code] = colors[colorIndex % colors.length];
          colorIndex++;
        });
        
        // Apply colors to cells
        document.querySelectorAll('.subject-cell').forEach(cell => {
          const code = cell.dataset.subjectCode;
          if (code && subjectColorMap[code]) {
            cell.style.backgroundColor = subjectColorMap[code];
          }
        });
      });
      
      // Labels
      const themeLabel = document.createElement('label');
      themeLabel.textContent = 'Theme: ';
      themeLabel.appendChild(themeSelector);
      
      const colorLabel = document.createElement('label');
      colorLabel.textContent = 'Color: ';
      colorLabel.appendChild(colorPicker);
      
      // Append all elements to toolbar
      toolbar.appendChild(themeLabel);
      toolbar.appendChild(colorLabel);
      toolbar.appendChild(applyColorBtn);
      toolbar.appendChild(resetBtn);
      toolbar.appendChild(downloadBtn);
      
      return toolbar;
    }
  
    // Create the schedule table
    function createScheduleTable(courses) {
      const tableContainer = document.createElement('div');
      tableContainer.className = 'schedule-table-container';
      
      const table = document.createElement('table');
      table.className = 'visual-schedule theme-default';
      
      // Create header row with days
      const headerRow = document.createElement('tr');
      const emptyHeader = document.createElement('th');
      emptyHeader.className = 'time-header';
      headerRow.appendChild(emptyHeader);
      
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      days.forEach(day => {
        const th = document.createElement('th');
        th.textContent = day;
        th.className = 'day-header';
        headerRow.appendChild(th);
      });
      
      const thead = document.createElement('thead');
      thead.appendChild(headerRow);
      table.appendChild(thead);
      
      // Create time rows
      const tbody = document.createElement('tbody');
      
      // Find the earliest and latest times in the schedule
      let earliestHour = 23;
      let latestHour = 0;
      
      courses.forEach(course => {
        if (course.startTime.hours < earliestHour) earliestHour = course.startTime.hours;
        if (course.endTime.hours > latestHour) latestHour = course.endTime.hours;
        // If end time is on the hour exactly, we don't need another row for it
        if (course.endTime.minutes === 0 && course.endTime.hours > 0) {
          latestHour = Math.max(latestHour, course.endTime.hours - 1);
        }
      });
      
      // Ensure reasonable bounds
      earliestHour = Math.max(7, earliestHour);
      latestHour = Math.min(21, latestHour);
      
      // Create time slots (hourly)
      for (let hour = earliestHour; hour <= latestHour; hour++) {
        const timeRow = document.createElement('tr');
        timeRow.className = 'time-row';
        timeRow.dataset.hour = hour;
        
        // Time cell
        const timeCell = document.createElement('td');
        timeCell.className = 'time-cell';
        timeCell.textContent = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
        timeRow.appendChild(timeCell);
        
        // Day cells
        days.forEach(day => {
          const dayCell = document.createElement('td');
          dayCell.className = 'day-cell';
          dayCell.dataset.day = day;
          dayCell.dataset.hour = hour;
          timeRow.appendChild(dayCell);
        });
        
        tbody.appendChild(timeRow);
      }
      
      table.appendChild(tbody);
      tableContainer.appendChild(table);
      return tableContainer;
    }
  
    // Place the subject cells in the schedule
    function placeSubjectCells(courses) {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      courses.forEach(course => {
        const dayIndex = days.indexOf(course.day);
        if (dayIndex === -1) return;
        
        // Create subject cell
        const subjectCell = document.createElement('div');
        subjectCell.className = 'subject-cell';
        // Add data attributes for easier selection
        subjectCell.dataset.subjectCode = course.subject;
        subjectCell.dataset.subjectTitle = course.title;
        
        subjectCell.innerHTML = `
          <div class="subject-code">${course.subject}</div>
          <div class="subject-title">${course.title}</div>
          <div class="subject-room">${course.room}</div>
          <div class="subject-time">${course.startTime.toString()} - ${course.endTime.toString()}</div>
        `;
  
        // Set the background color
        subjectCell.style.backgroundColor = course.color;
        
        // Make cells selectable for custom coloring
        subjectCell.addEventListener('click', function(e) {
          e.stopPropagation();
          
          // First, clear all selected cells
          document.querySelectorAll('.subject-cell.selected').forEach(cell => {
            cell.classList.remove('selected');
          });
          
          // Then add selected class to clicked cell
          this.classList.add('selected');
          
          // Option to select all cells with the same subject code
          if (e.shiftKey) {
            const subjectCode = this.dataset.subjectCode;
            document.querySelectorAll(`.subject-cell[data-subject-code="${subjectCode}"]`).forEach(cell => {
              cell.classList.add('selected');
            });
          }
        });
  
        // Calculate position and size
        const startDecimal = course.startTime.decimal();
        const endDecimal = course.endTime.decimal();
        const closestHour = Math.floor(startDecimal);
        
        const startRow = document.querySelector(`.time-row[data-hour="${closestHour}"]`);
        if (!startRow) return;
  
        const dayCell = startRow.querySelector(`.day-cell[data-day="${course.day}"]`);
        if (!dayCell) return;
        
        const rowHeight = 60;
        const minuteOffset = (startDecimal - closestHour) * rowHeight;
        const duration = endDecimal - startDecimal;
        const height = duration * rowHeight;
        
        // Set styles for positioning
        subjectCell.style.top = `${minuteOffset}px`;
        subjectCell.style.height = `${height}px`;
        subjectCell.style.width = 'calc(100% - 4px)';
        
        // Add the cell to the day column
        dayCell.style.position = 'relative';
        dayCell.appendChild(subjectCell);
  
        // Adjust font size after the cell is added to the DOM
        setTimeout(() => adjustTitleFontSize(subjectCell), 0);
      });
    }
  
    function adjustTitleFontSize(subjectCell) {
      const titleElement = subjectCell.querySelector('.subject-title');
      const title = titleElement.textContent;
      
      // Create a temporary measuring element
      const temp = document.createElement('div');
      temp.style.cssText = `
        position: absolute;
        visibility: hidden;
        width: ${titleElement.offsetWidth}px;
        font-size: 12px;
        line-height: 1.2;
      `;
      temp.textContent = title;
      document.body.appendChild(temp);
  
      // Measure the height
      const height = temp.offsetHeight;
      const lineHeight = parseFloat(getComputedStyle(temp).lineHeight);
      const lines = Math.round(height / lineHeight);
  
      // Remove existing classes
      titleElement.classList.remove('single-line', 'two-lines', 'three-lines');
  
      // Add appropriate class based on number of lines
      if (lines === 1) {
        titleElement.classList.add('single-line');
      } else if (lines === 2) {
        titleElement.classList.add('two-lines');
      } else {
        titleElement.classList.add('three-lines');
      }
  
      // Clean up
      document.body.removeChild(temp);
    }
  
  })();