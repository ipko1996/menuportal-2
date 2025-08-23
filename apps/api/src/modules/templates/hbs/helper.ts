import { format, parseISO } from 'date-fns';
import { hu } from 'date-fns/locale';
import * as Handlebars from 'handlebars';

import { WeekMenuDayDto } from '@/modules/week-menu/dto/week-menu-response.dto';

interface DayWithName {
  dayName: string;
  dayData: WeekMenuDayDto | undefined;
}

// Helper function to format a date using date-fns and Hungarian locale
const formatDate = (date: Date): string => {
  return format(date, 'yyyy. MM. dd.', { locale: hu });
};

// Register helper to format date range using date-fns
Handlebars.registerHelper(
  'formatDateRange',
  (weekStart: string, weekEnd: string): string => {
    const start = parseISO(weekStart);
    const end = parseISO(weekEnd);
    return `${formatDate(start)} - ${formatDate(end)}`;
  }
);

// Register helper to format price in Hungarian Forint
Handlebars.registerHelper(
  'formatPrice',
  (price: number): string => `${price}.-`
);

// Register helper to get days in correct order with Hungarian names
Handlebars.registerHelper(
  'getDaysInOrder',
  (days: Record<string, WeekMenuDayDto>, weekStart: string): DayWithName[] => {
    const dayNames: Record<number, string> = {
      0: 'VASÁRNAP', // Sunday
      1: 'HÉTFŐ', // Monday
      2: 'KEDD', // Tuesday
      3: 'SZERDA', // Wednesday
      4: 'CSÜTÖRTÖK', // Thursday
      5: 'PÉNTEK', // Friday
      6: 'SZOMBAT', // Saturday
    };

    const startDate = parseISO(weekStart);
    const result: DayWithName[] = [];

    // Generate 7 days starting from weekStart
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const dateString = format(currentDate, 'yyyy-MM-dd');
      const dayOfWeek = currentDate.getDay();

      result.push({
        dayName: dayNames[dayOfWeek],
        dayData: days[dateString],
      });
    }

    return result;
  }
);

// Register helper for logical OR operation
Handlebars.registerHelper('or', (a: boolean, b: boolean): boolean => a || b);

export const template = `<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Heti Ajánlat</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }
        .menu-container {
            background-color: white;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .restaurant-name {
            font-size: 18px;
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 5px;
        }
        .restaurant-info {
            font-size: 12px;
            margin-bottom: 20px;
        }
        .week-title {
            font-size: 16px;
            font-weight: bold;
            letter-spacing: 2px;
            margin-bottom: 10px;
        }
        .week-dates {
            font-size: 14px;
            margin-bottom: 15px;
        }
        
        .fixed-items {
            margin-bottom: 20px;
        }
        .fixed-items table {
            width: 100%;
            border-collapse: collapse;
        }
        .fixed-items td {
            padding: 2px 0;
            font-size: 14px;
        }
        .fixed-items .item-name {
            width: 70%;
        }
        .fixed-items .item-price {
            width: 30%;
            text-align: left;
        }

        .menu-table {
            width: 100%;
            border-collapse: collapse;
            border: 3px solid black;
        }
        .menu-table th,
        .menu-table td {
            border: 1px solid black;
            padding: 6px;
            text-align: left;
            vertical-align: top;
            font-size: 12px;
        }
        .day-cell {
            font-weight: bold;
            width: 12%;
            background-color: #f0f0f0;
            border-right: 2px solid black !important;
            border-left: 2px solid black !important;
        }
        .food-cell {
            width: 68%;
            border-right: 2px solid black !important;
            padding: 4px 6px;
        }
        .price-cell {
            width: 20%;
            text-align: right;
            font-weight: bold;
            border-left: 2px solid black !important;
        }
        .menu-label {
            font-weight: bold;
            font-style: italic;
            background-color: #f8f8f8;
            display: inline-block;
            padding: 2px 4px;
            margin-bottom: 2px;
        }
        .dish-item {
            margin: 2px 0;
            padding: 1px 0;
            border-bottom: 1px solid #ddd;
        }
        .dish-item:last-child {
            border-bottom: none;
        }
        .empty-day {
            color: #666;
            font-style: italic;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            text-align: center;
        }
        .footer p {
            margin: 5px 0;
        }
        
        /* Special styling for menu rows */
        .menu-row {
            background-color: #f8f8f8;
        }
        
        /* Ensure borders are visible */
        .menu-table td {
            border: 1px solid black !important;
        }
        .menu-table tr {
            border: 1px solid black !important;
        }
        
        /* Top and bottom borders for table */
        .menu-table {
            border-top: 3px solid black !important;
            border-bottom: 3px solid black !important;
        }
    </style>
</head>
<body>
    <div class="menu-container">
        <div class="header">
            <div class="restaurant-name">ZÓNA ÉTTEREM</div>
            <div class="restaurant-name">VESZPRÉM</div>
            <div class="restaurant-info">
                RADNÓTI TÉR 2<br>
                TEL.: 88/426-706
            </div>
            
            <div class="week-title">H E T I &nbsp; A J Á N L A T</div>
            <div class="week-dates">{{formatDateRange weekStart weekEnd}}</div>
        </div>

        <div class="fixed-items">
            <table>
                <tr>
                    <td class="item-name"><strong>Levesek:</strong></td>
                    <td class="item-price"><strong>900.-</strong></td>
                </tr>
                <tr>
                    <td class="item-name"><strong>Húsos levesek:</strong></td>
                    <td class="item-price"><strong>1000.-</strong></td>
                </tr>
                <tr>
                    <td class="item-name"><strong>Saláták:</strong></td>
                    <td class="item-price"><strong>800.-</strong></td>
                </tr>
                <tr>
                    <td class="item-name"><strong>Köretek:</strong></td>
                    <td class="item-price"><strong>800.-</strong></td>
                </tr>
            </table>
        </div>

        <table class="menu-table">
            {{#each (getDaysInOrder days weekStart)}}
            <tr>
                <td class="day-cell">{{this.dayName}}</td>
                <td class="food-cell">
                    {{#if this.dayData.offers}}
                        {{#each this.dayData.offers}}
                            <div class="dish-item">{{this.dish.dishName}}</div>
                        {{/each}}
                    {{/if}}
                    
                    {{#if this.dayData.menus}}
                        {{#each this.dayData.menus}}
                            <div class="dish-item">
                                <div class="menu-label">{{this.menuName}}</div>
                                {{#each this.dishes}}
                                    {{this.dishName}}{{#unless @last}}, {{/unless}}
                                {{/each}}
                            </div>
                        {{/each}}
                    {{/if}}
                    
                    {{#unless (or this.dayData.offers this.dayData.menus)}}
                        <span class="empty-day">-</span>
                    {{/unless}}
                </td>
                <td class="price-cell">
                    {{#if this.dayData.offers}}
                        {{#each this.dayData.offers}}
                            <div class="dish-item">
                                {{#if this.price}}{{formatPrice this.price}}{{/if}}
                            </div>
                        {{/each}}
                    {{/if}}
                    
                    {{#if this.dayData.menus}}
                        {{#each this.dayData.menus}}
                            <div class="dish-item">{{formatPrice this.price}}</div>
                        {{/each}}
                    {{/if}}
                    
                    {{#unless (or this.dayData.offers this.dayData.menus)}}
                        <span class="empty-day">-</span>
                    {{/unless}}
                </td>
            </tr>
            {{/each}}
        </table>

        <div class="footer">
            <p><strong>Elviteles doboz ára: 100 FT</strong></p>
            <p>Étlapunk aktuális ajánlata a Facebook oldalon tekinthető meg.</p>
            <p><em>Jó étvágyat kíván az egész Zóna étterem személyzete!</em></p>
        </div>
    </div>
</body>
</html>
`;

export default Handlebars;
