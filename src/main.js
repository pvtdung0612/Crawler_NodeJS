const axios = require('axios')
const cheerio = require('cheerio')
const excel = require('exceljs');

const url = 'https://jprp.vn/index.php/JPRP/issue/archive'
const outputFile = 'data.xlsx'
const result = []

// thu thập, truy cập vào đường link các tập báo
const getBooks = async (url) => {
    try {
        const response = await axios.get(url)
        const $ = cheerio.load(response.data)

        // thu thập link tập báo
        $('.media-body').map((i, el) => {
            const urlArticle = $(el).find('a').attr('href')
            getArticles(urlArticle)
        })

    } catch (error) {
        console.error(error)
    }
}

// truy cập vào đường link tập báo để thu thập, truy cập đường link bài báo 
const getArticles = async (url) => {
    try {
        const response = await axios.get(url)
        const $ = cheerio.load(response.data)

        // thu thập ngày đăng của tập đang truy cập
        let dateArticle = $('.heading .published').text().replace("Đã đăng:", "").trim();

        // lọc tất cả bài báo đăng cùng ngày trong 1 tập
        $('.media-body').each((index, el) => { // lặp từng phần tử có class là job__list-item
            const urlArticle = $(el).find('a').attr('href'); // lấy tên job, được nằm trong thẻ a < .job__list-item-title
            getArticle(urlArticle)
        })

    } catch (error) {
        console.error(error)
    }
}

// hàm truy cập bài báo cụ thể từ url bài báo
const getArticle = async (url) => {
    try {
        const response = await axios.get(url)
        const $ = cheerio.load(response.data)

        let nameArticle = $('.article-details').find('header h2').text().trim().replace(/(\n|\r|\r\n|\n\r)/g, '');
        let numArticle = $('.article-details').find('.panel-body .title').text().trim().replace(/(\n|\r|\r\n|\n\r)/g, '');
        let dateArticle = $('.date-published').text().replace("Đã đăng:", "").trim().replace(/(\n|\r|\r\n|\n\r)/g, '');
        if (dateArticle == "") dateArticle = "undefinded";
        let DOIArticle = $('.doi').find('a').attr('href');

        // console.log("\nnameArticle: " + nameArticle + "\nnumArticle: " + numArticle +
        //     "\ndateArticle: " + dateArticle + "\nDOIArticle: " + DOIArticle
        // )
        
        const resultRow = {
            nameArticle: nameArticle,
            numberArticle: numArticle,
            dateArticle: dateArticle,
            DOIArticle: DOIArticle
        }
        result.push(resultRow)
        exportResults(result)
    } catch (error) {
        console.error(error)
    }
}

// Export data
const exportResults = (parsedResults) => {
    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet('sheet');
    
    worksheet.columns = [
        { header: 'Name Article', key: 'nameArticle'},
        { header: 'Number Article', key: 'numberArticle'},
        { header: 'Date Article', key: 'dateArticle'},
        { header: 'DOI Article', key: 'DOIArticle'}
    ];
    
    worksheet.addRows(result);

    workbook.xlsx.writeFile(outputFile);
}

getBooks(url)