export async function authenticate(page) {
    await page.goto('https://page.kakao.com/inven/recent');
    const button = await page.waitForSelector('div.mt-32pxr > button');
    const buttonContent = await button?.evaluate(node => node.textContent);
    if (!button || buttonContent !== '로그인') {
        throw new Error('Login button not found');
    }
    await button.click();
    await page.waitForNavigation();
    const submitButton = await page.waitForSelector('div.login_kakaomail > form button[type="submit"]');
    const usernameInput = await page.waitForSelector('input[name="loginId"]');
    const passwordInput = await page.waitForSelector('input[name="password"]');
    if (!usernameInput || !passwordInput || !submitButton) {
        throw new Error('Input not found');
    }
    const username = process.env.KAKAO_USERNAME;
    const password = process.env.KAKAO_PASSWORD;
    if (!username || !password) {
        throw new Error('KAKAO_USERNAME or KAKAO_PASSWORD environment variable not found');
    }
    await usernameInput.type(username);
    await passwordInput.type(password);
    await submitButton.click();
    await page.waitForNavigation({
        waitUntil: 'networkidle2',
    });
}
