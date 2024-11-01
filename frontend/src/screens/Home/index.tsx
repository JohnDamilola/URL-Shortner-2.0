/*
MIT License

Copyright (c) 2022 John Damilola, Leo Hsiang, Swarangi Gaurkar, Kritika Javali, Aaron Dias Barreto

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
import Main from 'assets/images/mh.svg';
import Search from 'antd/lib/input/Search';
import { Link } from 'react-router-dom';
import './styles.scss';
import toast, { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import http from 'utils/api';
import Swal from 'sweetalert2';

const features = [
	{
		title: 'Link Management',
		desciption:
			'A comprehensive solution to help make every point of connection between your content and your audience more powerful.',
		features: [
			['Create custom short links', <i className="ml-2 fas fa-link"></i>],
			['Enable/Disable custom links', <i className="ml-2 fas fa-toggle-on"></i>],
			['Set expiration date', <i className="ml-2 fas fa-stopwatch"></i>],
			['Secure custom links', <i className="ml-2 fas fa-lock"></i>],
		],
	},
	{
		title: 'QR Codes',
		desciption: 'QR Code solutions for every customer, business and brand experience.',
		features: [
			['Fully customizable QR Codes', <i className="ml-2 fas fa-qrcode"></i>],
			['Download QR Codes', <i className="ml-2 fas fa-download"></i>],
		],
	},
	{
		title: 'Track Engagement',
		desciption:
			'A comprehensive solution to help make every point of connection between your content and your audience more powerful.',
		features: [
			['See stats for no. of visits', <i className="ml-2 far fa-chart-bar"></i>],
			['UTM code generator', <i className="ml-2 fas fa-code"></i>],
		],
	},
];

const Home = () => {
	const [longUrl, setLongUrl] = useState('');
	const [shortenedUrl, setShortenedUrl] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const handleShorten = async () => {
    if (!longUrl) {
      return toast('Please enter a url first', {
        icon: '👏',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    }
    setIsLoading(true);
		await http
		    .post(`http://localhost:5002/links/create_anonymous`, {
				long_url: longUrl,
			})
			.then((res: any) => {
				const { link } = res.data || {};
				setShortenedUrl(link.stub);
				toast('Yaay! Your link has been shortened!', {
					icon: '👏',
					style: {
						borderRadius: '10px',
						background: '#333',
						color: '#fff',
					},
				});
				setIsLoading(false);
			})
			.catch((err) => {
				Swal.fire({
					icon: 'error',
					title: 'Link Creation Failed!',
					text: 'An error occurred, please try again',
					confirmButtonColor: '#221daf',
				});
				setIsLoading(false);
			});
	};

	const handleCopy = async (text: any) => {
		if ('clipboard' in navigator) {
			await navigator.clipboard.writeText(text);
		} else {
			document.execCommand('copy', true, text);
		}
		toast('URL copied successfully!', {
			icon: '👏',
			style: {
				borderRadius: '10px',
				background: '#333',
				color: '#fff',
			},
		});
	};

	return (
		<div className="home">
			<Toaster />
			<section className="masthead">
				<div className="container">
					<div className="row align-items-center justify-content-centers">
						<div className="col-md-6 text-centers">
							<h1>
								Keep it <span>brief!</span> An easier way to share & track links.
							</h1>
							<p>
								URL Shortener is a tool to help you create simple and easy-to-remember custom links for
								important links and also measure impact.
							</p>
							<div className="row justify-content-centers">
								<div className="col-md-9">
									<Search
										placeholder="Paste a link to shorten it"
										allowClear
										enterButton="Shorten Link"
										size="large"
                    onChange={(e) => setLongUrl(e.target.value)}
										onSearch={handleShorten}
                    loading={isLoading}
									/>
									{!isLoading && shortenedUrl && (
										<div className="result-pane">
											<div className="link d-flex flex-wrap justify-content-between align-items-center">
												<Link to={`http://localhost:5002/${shortenedUrl}`} rel="noreferrer" target="_blank">
													<p>http://localhost:5002/{shortenedUrl}</p>
												</Link>
												<button onClick={() => handleCopy(`url-bit.web.app/a/${shortenedUrl}`)}>
													Copy <i className="ml-2 fas fa-copy"></i>
												</button>
											</div>
											<div className="detail">
												<span>
													<Link to="/register">Create Account</Link> for custom back-half
													links, to manage links, qr codes & track engagements.
												</span>
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
						<div className="col-md-4 offset-md-1">
							<img className="img-fluid d-none d-lg-block" src={Main} alt="laptop with coffee" />
						</div>
					</div>
				</div>
			</section>
			<section className="features" id="features">
				<div className="container">
					<div className="row align-items-center justify-content-center">
						<div className="col-md-8 text-center">
							<h1>a short link, infinite possibilities.</h1>
							<p>
								All the tools you need to manage links and QR Codes and connect with audiences
								everywhere, in a single unified platform.
							</p>
						</div>
						<div className="col-md-12">
							<div className="row justify-content-centers">
								{features.map(({ title, desciption, features: _features }, i) => {
									return (
										<div className="col-md-4">
											<div className="feature-item">
												<h4>{title}</h4>
												<p>{desciption}</p>
												<ul>
													{_features.map((item, j) => (
														<li key={j}>
															{item[0]} {item[1]}
														</li>
													))}
												</ul>
												<Link to="/register">
													<button className="btn btn-main btn-block mt-4">
														Get Started for Free
													</button>
												</Link>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default Home;
