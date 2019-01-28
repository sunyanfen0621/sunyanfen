require('./index.less');
require('./fetch-polyfill');

(function () {
    // polyfill
    if (window.NodeList && !NodeList.prototype.forEach) {
        NodeList.prototype.forEach = Array.prototype.forEach;
    }
	async function getLang() {
		const data = await dd.device.base.getSettings();
		return data
	}
	getLang().then((res) => {
		const dingLang = res.language
		const langArr = ['en','zh-Hans','zh-Hant','ja','vi','th','my']
		const sourceLang = langArr.indexOf(dingLang) < 0 ?  'en' : dingLang
		const i18n = {
			title: {
				'en': 'Translation quality',
				'zh-Hans': '翻译评分',
				'zh-Hant': '翻譯評分',
				'ja': '翻訳の品質',
				'vi': 'Chất lượng bản dịch',
				'th':'คุณภาพคำแปล',
				'my': 'Kualiti penterjemahan'
			},
			info: {
				'en': 'Revision (optional)',
				'zh-Hans': '修改译文（选填）',
				'zh-Hant': '修改譯文（選填）',
				'ja': '修正版 (オプション)',
				'vi': 'Chỉnh sửa (tùy chọn)',
				'th': 'การตรวจแก้ (ถ้ามี)',
				'my': 'Penyemakan (tidak wajib)'
			},
			feedback: {
				'en': 'Your suggestions make AliTranslation better',
				'zh-Hans': '你的评价让阿里翻译做的更好',
				'zh-Hant': '您的建議將讓阿里翻譯做得更好',
				'ja': '您的建議將讓阿里翻譯做得更好',
				'vi': 'Gợi ý của bạn giúp cho AliTranslation trở nên tốt hơn',
				'th': 'คำแนะนำของคุณจะช่วยให้คำแปลของ  AliTranslation ดียิ่งขึ้น',
				'my': 'Cadangan anda menjadikan AliTranslation lebih cekap'
			},
			placeholder: {
				'en': 'Please enter your revised translation',
				'zh-Hans': '请输入正确的译文',
				'zh-Hant': '請輸入正確的譯文',
				'ja': '修正した翻訳を入力してください',
				'vi': 'Vui lòng nhập bản dịch được chỉnh sửa của bạn',
				'th': 'กรุณาป้อนคำแปลที่ตรวจแก้',
				'my': 'Sila masukkan penterjemahan anda yang telah disemak'
			},
			cancel: {
				'en': 'Cancel',
				'zh-Hans': '取消',
				'zh-Hant': '取消',
				'ja': '取消',
				'vi': 'Hủy ',
				'th': 'ยกเลิก',
				'my': 'Batal'
			},
			submit: {
				'en': 'Send',
				'zh-Hans': '发送',
				'zh-Hant': '發送',
				'ja': '送信',
				'vi': 'Gửi',
				'th': 'ส่ง',
				'my': 'Hantar'
			},
			grade: {
				'en': ['Translation is very poor', 'Translation is relatively poor', 'Translation is ordinary', 'Translation is relatively good', 'Translation is very good'],
				'zh-Hans': ['翻译很差', '翻译较差', '翻译一般', '翻译较好', '翻译非常好'],
				'zh-Hant': ['翻譯很差', '翻譯較差', '翻譯一般', '翻譯較好', '翻譯非常好'],
				'ja': ['翻訳が非常に低品質', '翻訳が比較的低品質', '翻訳が普通の品質', '翻訳が比較的高品質', '翻訳が非常に高品質'],
				'vi': ['Bản dịch rất kém', 'Bản dịch tương đối kém', 'Bản dịch bình thường', 'Bản dịch tương đối tốt', 'Bản dịch rất tốt'],
				'th': ['คุณภาพคำแปลแย่มาก', 'คุณภาพคำแปลค่อนข้างแย่', 'คุณภาพคำแปลอยู่ในระดับปกติ', 'คุณภาพคำแปลค่อนข้างดี', 'คุณภาพคำแปลดีมาก'],
				'my': ['Penterjemahan sangat lemah', 'Penterjemahan agak lemah', 'Penterjemahan adalah biasa', 'Penterjemahan agak bagus', 'Penterjemahan sangat bagus']
			},
			thanks: {
				'en': 'Thank you.',
				'zh-Hans': '感谢您的反馈。',
				'zh-Hant': '謝謝。',
				'ja': 'ありがとうございます。',
				'vi': 'Cảm ơn',
				'th': 'ขอบคุณ',
				'my': 'Terima kasih'
			}
		}

		const content = document.querySelector('#content')
		let template = `<div class="content">
			<h3 class="scoring">${i18n.title[sourceLang]}</h3>
			<ul id="stars">
				<li>☆</li>
				<li>☆</li>
				<li>☆</li>
				<li>☆</li>
				<li>☆</li>
			</ul>
			<div class="info">${i18n.feedback[sourceLang]}</div>
			<span class="online"></span>
			<h3>原文:</h3>
			<p class="originaltext"></p>
			<span class="online"></span>
			<h3>${i18n.info[sourceLang]}</h3>
			<textarea placeholder="${i18n.placeholder[sourceLang]}"></textarea>
		</div>
		<div class="buttons">
			<div id="cancel" class="button">${i18n.cancel[sourceLang]}</div>
			<div id="submit" class="button">${i18n.submit[sourceLang]}</div>
		</div>`
		content.innerHTML = template;
		const originaltext = document.querySelector('.originaltext')
		const li = document.querySelectorAll('li')
		const submit = document.querySelector('#submit')
		const cancel = document.querySelector('#cancel')
		const text = document.querySelector('textarea')
		const info = document.querySelector('.info')
		const langMap = {
			'zh_CN' : 'zh',
			'en_US' : 'en',
			'es_ES' : 'en',
			'ru_RU' : 'ru',
			'zh_TW' : 'zh-tw',
			'ja_JP' : 'ja',
			'fr_FR' : 'fr'
		}

		const getParam = () => {
			const url = window.location.href;
			let hash;
			let myJson = {};
			let hashes = url.slice(url.indexOf('?') + 1).split('&');
			hashes.forEach(item => {
				hash = item.split('=');
				myJson[hash[0]] = hash[1];
			});
			return myJson;
		}

		const urlParam = getParam();
		
		if(urlParam.source!==undefined){
			originaltext.innerHTML = decodeURI(urlParam.source)
		}else{
			originaltext.innerHTML = "你好";
		}
		if(urlParam.target!==undefined){
			text.value = decodeURI(urlParam.target);
		}else{
			text.value = "hello"
		}
		
		let rate = 0;
		li.forEach((item, i) => {
			item.addEventListener('click', () => {
				rate = i + 1
				li.forEach((liItem, j) => {
					liItem.innerHTML = j < rate ? '<i>★</i>' : '☆'
					info.innerHTML = i18n.grade[sourceLang][i]
				})
			}, false)
		});

		submit.addEventListener('click', () => {
			const params = {
				...urlParam,
				"appName": "lippi-translate",
				"event": "score",
				"os": dd.env.platform,
				"platform": 'dd',
				"userId": 1,
				"userType": 'dd',
				"score": rate,
				"target": text.value || urlParam.target,
				"sourceLanguage": langMap[urlParam.sourceLanguage] || 'en',
				"targetLanguage": langMap[urlParam.targetLanguage] || 'en',
			}


			const url = `https://translate.alibaba.com/translationopenseviceapp/trans/TranslateEventCallBack.do?eventDTO=${JSON.stringify(params)}`
			const feedbackTemplate = `<div id="feedbackContent">
				<div id="successIcon"></div>
				<div id="feedbackText">${i18n.thanks[sourceLang]}</div>
			</div>`
			fetch(url, {
				method: 'GET',
				mode: 'no-cors',
				credentials: 'include',
			}).then(response => {
				content.innerHTML = feedbackTemplate;
				setTimeout(() => {
					dd.internal.notify.closeModal()
				}, 2000);
			}).catch(error => {
				alert(error)
			})
		}, false)
		
		
		cancel.addEventListener('click', () => {
			dd.internal.notify.closeModal()
		}, false)
	}).catch(error => {
        console.log(error);
    });
})();
