// content.js
(() => {
    // Wait for the page to fully load
    window.addEventListener('load', () => {
      // Check if we're on the right page and the schedule table exists
      const scheduleContainer = document.querySelector('.assessment_schedule-container');
      if (!scheduleContainer) return;
      
      // Create the Generate Schedule button
      const generateButton = document.createElement('button');
      generateButton.textContent = 'Generate Visual Schedule';
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
            color: getRandomColor() // Assign random colors to differentiate subjects
          });
        }
      }
      
      return {
        courses: scheduleData,
        title: sectionTitle
      };
    }
  
    // Generate a random color for subjects
    function getRandomColor() {
      const colors = [
        '#4CAF50', // Green
        '#2196F3', // Blue
        '#9C27B0', // Purple
        '#FF9800', // Orange
        '#F44336', // Red
        '#009688', // Teal
        '#3F51B5', // Indigo
        '#795548', // Brown
        '#607D8B'  // Blue Grey
      ];
      return colors[Math.floor(Math.random() * colors.length)];
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
        selectedCells.forEach(cell => {
          cell.style.backgroundColor = colorPicker.value;
        });
      });
      
 
      
      // Download button
      const downloadBtn = document.createElement('button');
      downloadBtn.textContent = 'Save as PNG';
      downloadBtn.className = 'download-btn';
      downloadBtn.addEventListener('click', async () => {
        const scheduleElement = document.querySelector('.visual-schedule-container');
        if (!scheduleElement) return;
      
        // Load html2canvas dynamically if not already loaded
        if (typeof html2canvas === 'undefined') {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
          script.onload = () => saveScheduleAsPNG(scheduleElement);
          document.body.appendChild(script);
        } else {
          saveScheduleAsPNG(scheduleElement);
        }
      });
      
      function saveScheduleAsPNG(element) {
        html2canvas(element).then(canvas => {
          const link = document.createElement('a');
          link.download = 'schedule.png';
          link.href = canvas.toDataURL('image/png');
          link.click();
        });
      }
      
      // Reset button
      const resetBtn = document.createElement('button');
      resetBtn.textContent = 'Reset Colors';
      resetBtn.className = 'reset-btn';
      resetBtn.addEventListener('click', () => {
        document.querySelectorAll('.subject-cell').forEach(cell => {
          cell.style.backgroundColor = '';
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
  
    // Place subject cells in the schedule
    function placeSubjectCells(courses) {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      courses.forEach(course => {
        const dayIndex = days.indexOf(course.day);
        if (dayIndex === -1) return; // Skip if day not found
        
        // Create subject cell
        const subjectCell = document.createElement('div');
        subjectCell.className = 'subject-cell';
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
          if (this.classList.contains('selected')) {
            this.classList.remove('selected');
          } else {
            this.classList.add('selected');
          }
        });
  
        // Find the cell for this day and starting hour
        const startDecimal = course.startTime.decimal();
        const endDecimal = course.endTime.decimal();
        const closestHour = Math.floor(startDecimal);
        
        // Get the day column
        const startRow = document.querySelector(`.time-row[data-hour="${closestHour}"]`);
        if (!startRow) return;
  
        const dayCell = startRow.querySelector(`.day-cell[data-day="${course.day}"]`);
        if (!dayCell) return;
        
        // Calculate position and size
        const rowHeight = 60; // Height of each hour row in pixels
        
        // Calculate top position based on minutes past the hour
        const minuteOffset = (startDecimal - closestHour) * rowHeight;
        const top = minuteOffset;
        
        // Calculate height based on duration
        const duration = endDecimal - startDecimal;
        const height = duration * rowHeight;
        
        // Set styles for positioning
        subjectCell.style.top = `${top}px`;
        subjectCell.style.height = `${height}px`;
        subjectCell.style.width = '100%';
        
        // Add the cell to the day column
        dayCell.style.position = 'relative';
        dayCell.appendChild(subjectCell);
      });
    }
  })();