document.addEventListener('DOMContentLoaded', function() {
    const hotCategories = ['AI 配音', '对标批量下载'];

    const papaScript = document.createElement('script');
    papaScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js';
    document.head.appendChild(papaScript);

    papaScript.onload = () => {
        fetch('xhstools.csv') // We will load the original csv file
            .then(response => response.text())
            .then(csvText => {
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: function(results) {
                        // Safeguard for BOM character in CSV header
                        const fields = results.meta.fields;
                        if (fields && fields.length > 0 && fields[0].startsWith('\ufeff')) {
                            const bomField = fields[0];
                            const cleanField = bomField.substring(1);
                            results.meta.fields[0] = cleanField;
                            results.data.forEach(row => {
                                if(row[bomField]) {
                                    row[cleanField] = row[bomField];
                                    delete row[bomField];
                                }
                            });
                        }
                        
                        const tools = results.data;
                        if(tools.length === 0) {
                            const content = document.getElementById('content');
                            content.innerHTML = '<p>CSV 文件为空或无法解析，请检查文件内容。</p>';
                            return;
                        }
                        setupPage(tools);
                    }
                });
            })
            .catch(error => {
                 console.error('Error fetching or parsing CSV:', error);
                 const content = document.getElementById('content');
                 content.innerHTML = '<p>无法加载 `xhstools.csv` 文件。请确保文件存在并且编码为 UTF-8。</p>';
            });
    };
    
    function setupPage(tools) {
        const categories = {};
        const orderedCategoryNames = []; // Array to maintain the original order

        tools.forEach(tool => {
            const categoryName = tool['类目名称'];
            if (!categoryName) return; 

            if (!categories[categoryName]) {
                categories[categoryName] = [];
                orderedCategoryNames.push(categoryName); // Add category in the order it appears
            }
            categories[categoryName].push(tool);
        });

        const sidebar = document.getElementById('sidebar');
        const content = document.getElementById('content');
        sidebar.innerHTML = ''; 
        content.innerHTML = ''; 
        const navUl = document.createElement('ul');

        orderedCategoryNames.forEach(categoryName => {
            // Populate sidebar
            const navLi = document.createElement('li');
            const navA = document.createElement('a');
            navA.href = `#category-${categoryName.replace(/\s+/g, '-')}`;
            navA.textContent = categoryName;

            if (hotCategories.includes(categoryName)) {
                const hotBadge = document.createElement('span');
                hotBadge.className = 'hot-badge';
                hotBadge.textContent = 'Hot';
                navA.appendChild(hotBadge);
            }
            navLi.appendChild(navA);
            navUl.appendChild(navLi);
            
            // Populate content area
            const section = document.createElement('section');
            section.id = `category-${categoryName.replace(/\s+/g, '-')}`;
            section.className = 'category-section';

            const title = document.createElement('h2');
            title.className = 'category-title';
            title.textContent = categoryName;
            if (hotCategories.includes(categoryName)) {
                const hotBadge = document.createElement('span');
                hotBadge.className = 'hot-badge';
                hotBadge.textContent = 'Hot';
                title.appendChild(hotBadge);
                hotBadge.style.marginLeft = '10px';
            }
            section.appendChild(title);
            
            const toolGrid = document.createElement('div');
            toolGrid.className = 'tool-grid';

            categories[categoryName].forEach(tool => {
                const toolCard = document.createElement('a');
                toolCard.className = 'tool-card';
                toolCard.href = tool['链接'];
                toolCard.target = '_blank';
                
                const name = document.createElement('h3');
                name.className = 'name';
                name.textContent = tool['名称'];
                
                const description = document.createElement('p');
                description.className = 'description';
                description.textContent = tool['简介'];

                toolCard.appendChild(name);
                toolCard.appendChild(description);
                toolGrid.appendChild(toolCard);
            });

            section.appendChild(toolGrid);
            content.appendChild(section);
        });

        sidebar.appendChild(navUl);
        
        // Add smooth scrolling and active state management
        const navLinks = document.querySelectorAll('.sidebar a');
        const contentSections = document.querySelectorAll('.category-section');

        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${entry.target.id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, { threshold: 0.5, rootMargin: '-50px 0px -50% 0px' });

        contentSections.forEach(section => {
            observer.observe(section);
        });
        
        if (navLinks.length > 0) {
            navLinks[0].classList.add('active');
        }
    }
}); 