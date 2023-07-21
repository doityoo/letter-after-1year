import { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import Header from '../../components/Header';
import { useSelector } from 'react-redux';
import GlobalStyle from '../../components/UI/GlobalStyle';
import TextEditor from '../../components/TextEditor';

import { database } from '../../services/firebase-config';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

// 날짜 출력 라이브러리(Dayjs)
import 'dayjs/locale/ko'; // 한국어 가져오기
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
dayjs.locale('ko');

interface sliceTextTypes {
	textBody: { context: string; initBody: true };
}

interface sliceEmailTypes {
	auth: { isUserEmail: string; isAuthenticated: false };
}

interface PeriodData {
	id: number;
	period: string;
}

const LetterForm = () => {
	const textBody = useSelector(
		(state: sliceTextTypes) => state.textBody.context
	);
	const userEmail = useSelector(
		(state: sliceEmailTypes) => state.auth.isUserEmail
	);
	const [name, setName] = useState<string>('');
	const [email, setEmail] = useState<string>('');
	const [errMSG, setErrMSG] = useState<string>('');
	const [isChecked, setIsChecked] = useState<boolean>(false);
	const [period, setPeriod] = useState<number | undefined>(undefined);

	const currentDate = dayjs(new Date()).format('YYYY년 MM월 DD일');
	const currentDateEng = dayjs(new Date()).format('YYYY. MM. DD.');

	const callApi = async () => {
		axios.get('/letterForm').then(() => {
			console.log('This is LetterForm page.');
		});
	};

	useEffect(() => {
		callApi();
	}, []);

	// console.log(period)
	let periodData: PeriodData[] = [
		{
			id: 0,
			period: '1년 뒤',
		},
		{
			id: 1,
			period: '6개월 뒤',
		},
		{
			id: 2,
			period: '3개월 뒤',
		},
	];

	function strCheck(str: string, type: string) {
		const REGEX = {
			EMAIL: /\S+@\S+\.\S+/,
		};
		if (type === 'email') {
			return REGEX.EMAIL.test(str);
		} else {
			return false;
		}
	}

	const submitHandler = async () => {
		if (strCheck(email, 'email') === false) {
			setErrMSG('이메일 형식이 올바르지 않습니다.');
			return false;
		}

		try {
			// 여기에서 예약된 날짜를 설정하고 서버로 전송해야 합니다.
			const reservationDate = new Date('2023-07-30T10:00:00');
			const emailData = {
				to: 'recipient@example.com',
				subject: 'Scheduled Email',
				text: 'This is a scheduled email to be sent on a specific date.',
			};

			const token = localStorage.getItem('userToken');
			if (!token) {
				console.error('User is not authenticated.');
				return;
			}

			// 서버에 토큰과 이메일 데이터를 전송합니다.
			const response = await fetch('/api/scheduleEmail', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ reservationDate, ...emailData }),
			});

			if (response.ok) {
				console.log('Email scheduled successfully!');
			} else {
				console.error('Error scheduling email:', response.statusText);
			}
		} catch (error) {
			console.error('Error scheduling email:', error);
		}
		// const colAdd = collection(database, 'send_email');
		// try {
		// 	await addDoc(colAdd, {
		// 		delivery: {
		// 			startTime: serverTimestamp(),
		// 		},
		// 		from: 'honesty407@gmail.com',
		// 		message: {},
		// 		template: {
		// 			data: {
		// 				sendDate: `${currentDateEng}`,
		// 				userName: `${name}`,
		// 				body: `${textBody}`,
		// 			},
		// 			name: 'sendEmail',
		// 		},
		// 		to: `${email}`,
		// 	});
		// 	console.log('Send email!');
		// } catch {
		// 	console.log('Not send email!');
		// }

		window.location.reload();
	};

	const handleChecked = (e: any) => {
		if (e.target.checked) {
			setIsChecked(e.target.checked);
			setEmail(userEmail);
		} else {
			setIsChecked(false);
			setEmail('');
		}
	};

	return (
		<Wrapper>
			<GlobalStyle />
			<Header />
			<StyledText1>
				<StyledDate>{currentDate}</StyledDate>
				<p>나에게, 또는 누군가에게</p>
				<p>편지를 남겨보세요</p>
			</StyledText1>
			<TextEditor />
			<p>✍🏻 발신자 이름</p>
			<Input
				type='text'
				placeholder='보내는 사람의 이름을 입력하세요'
				onChange={(e) => {
					setName(e.target.value);
				}}
			/>
			<p>✉️ 수신인</p>
			<Input
				type='email'
				placeholder='이메일을 입력하세요'
				value={email}
				onChange={(e) => {
					setEmail(e.target.value);
				}}
			/>
			{errMSG ? <ErrorMSG>{errMSG}</ErrorMSG> : ''}
			<ToMeCheckBox>
				<Checkbox
					type='checkbox'
					checked={isChecked}
					onChange={handleChecked}
				/>
				<label>나에게 보내기</label>
			</ToMeCheckBox>
			<p>📬 발송일</p>
			<ButtonWrap>
				{periodData.map((item) => (
					<PeriodButton
						key={item.id}
						onClick={() => {
							setPeriod(item.id);
						}}
						color='true'
					>
						{item.period}
					</PeriodButton>
				))}
			</ButtonWrap>
			<SendButton onClick={submitHandler}>보내기</SendButton>
		</Wrapper>
	);
};

export default LetterForm;

const Wrapper = styled.div`
	margin: 0 auto;
	width: 400px;
	padding: 0 20px;
	min-height: 100vh;
	background-color: #eeeae9;
`;
const StyledText1 = styled.h2`
	font-weight: 300;
	color: black;
`;
const StyledDate = styled.p`
	font-weight: 500;
`;
const ToMeCheckBox = styled.div`
	display: flex;
	margin-bottom: 20px;
`;
const Checkbox = styled.input`
	margin-right: 5px;
`;
const Input = styled.input`
	width: 100%;
	font-size: 16px;
	padding: 1rem;
	margin: 10px 0;
`;
const PeriodButton = styled.button`
	margin-bottom: 10px;
	height: 50px;
	border: 1px solid orange;
	background-color: transparent;
	color: black;
	&:focus {
		background-color: ${(props) => (props.color ? 'orange' : 'none')};
	}
`;
const ButtonWrap = styled.div`
	margin-top: 10px;
`;
const SendButton = styled.button`
	margin: 20px 0;
	height: 60px;
	font-size: 1.2rem;
`;
const ErrorMSG = styled.div`
	color: #b91d1d;
	font-size: 0.9rem;
	margin-bottom: 10px;
`;
