import * as React from "react";
import { Redirect } from "react-router-dom";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import * as p from "./Login.css";
import Box from '@material-ui/core/Box';


interface Props {}

interface State {
  username: string;
  password: string;
  verify_password: string;
  username_helper: string; 
  password_helper: string;
  token: string;
}

export default class Register extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { username: "", password: "", verify_password:"", username_helper: "", password_helper: "", token: "" };
    this.handleUsername = this.handleUsername.bind(this);
    this.handlePassword = this.handlePassword.bind(this);
    this.handleVerifyPassword = this.handleVerifyPassword.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleUsername(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ username: event.target.value });
  }

  handlePassword(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ password: event.target.value });
  }
  
  handleVerifyPassword(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ verify_password: event.target.value });
  }

  valid_email = (mail: string) => 
  {
   if (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(mail))
    {
      return (true)
    }
    return (false)
  }

  
  handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if(!this.valid_email(this.state.username)) {
      this.setState({username:"",password:"",verify_password:"",username_helper:"Not a valid email  ", password_helper:""});
    }
    
    else if(this.state.password === this.state.verify_password) {
      let data =
        "username=" +
        encodeURIComponent(this.state.username) +
        "&password=" +
        encodeURIComponent(this.state.password);
      fetch("/quel/token/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          accept: "application/json",
        },
        body: data,
      })
        .then((res) => res.json())
        .then((result) => {
          if ("access_token" in result) {
            let token = result["access_token"];
            window.sessionStorage.setItem("token", token);
            this.setState({ username: this.state.username });
          } else {
            this.setState({ username: "", password: "",verify_password:"",username_helper:"Username already used", password_helper: "" });
          }
        });
    }
    else {
      this.setState({username_helper: "", password_helper:"Passwords don't match", password:"",verify_password:""});
    }
    event.preventDefault();
  }

  render() {
    if (window.sessionStorage.getItem("token")) {
      return <Redirect to="/" />;
    }

    console.log("Register style "+p);
    
    return (
      <Container maxWidth="xs">
        <CssBaseline />
        <div className="paper">
          <Avatar className="avatar">
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h4">
            Register
          </Typography>
          <form className="form" noValidate onSubmit={this.handleSubmit}>
            <TextField 
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="username"
              label="Email"
              name="username"
              value={this.state.username}
              onChange={this.handleUsername}
              helperText={this.state.username_helper}
              error={this.state.username_helper!==""}
              autoFocus
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={this.state.password}
              onChange={this.handlePassword}
              helperText={this.state.password_helper}
              error={this.state.password_helper!==""}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="verify_password"
              label="Verify Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={this.state.verify_password}
              onChange={this.handleVerifyPassword}

            /> <br /> <br />
            <h2> Terms and Services </h2>  <br /> 
            <div style={{height: 200, width: 500, overflow: 'scroll'}}> 
<h3> I. Purpose of the Study </h3>
This research is being conducted by Jordan Boyd-Graber at the University of Maryland, College Park. We are inviting you to participate in this research project because you can help label data about ambiguous people, places, and events in text passages. The purpose of this research project is to use this labeled information to help computers understand language. 		
<h3> II. Procedures  </h3>
The procedures involve first signing up on the website with an email and password. You will be instructed to label information about people, places, and events from datasets that have been publicly published. <i> Each annotation session will take no longer than 1 hour. You may choose to participate in a maximum of ten sessions, depending on your interest. Thus, your overall participation will not exceed 10 hours. </i>
<h3> III. Potential Risks and Discomforts </h3>
There are no known risks associated to participants of this study. 
<h3> IV. Confidentiality 	</h3> 	 						
We will not ask you for any personal information beyond your email address. Any potential loss of confidentiality will be minimized by storing data securely in a password-protected account. Only principal investigators and co-investigators have access to any identifying sensitive information. After the end of the experiment, data will be anonymized prior to public release.	<br />
If we write a report or article about this research project, your identity will be protected to the maximum extent possible. Your information may be shared with representatives of the University of Maryland, College Park or governmental authorities if you or someone else is in danger or if we are required to do so by law. 
<h3> V. Compensation	 </h3>			
<i> Ten users will be randomly selected to receive a $10 gift card.		<br />		
If you will earn more than $100 as a research participant in this study, you must provide your name, address and SSN to receive compensation. <br />
If you do not earn more than $100 only your name and address will be collected to receive compensation. </i>
<h3> VI. Right to Withdraw and Questions </h3>			
Your participation in this research is completely voluntary. You may choose not to take part at all. If you decide to participate in this research, you may stop participating at any time. If you decide not to participate in this study or if you stop participating at any time, you will not be penalized or lose any benefits to which you otherwise qualify.				
If you decide to stop taking part in the study, if you have questions, concerns, or complaints, or if you need to report an injury related to the research, please contact the investigator: <br />
Jordan Boyd-Graber <br />
 Iribe 4146 <br />
University of Maryland  <br />
jbg@umiacs.umd.edu  <br />
(301) 405-6766  
<h3> VII. Participant Rights </h3>				
If you have questions about your rights as a research participant or wish to report a research-related injury, please contact: <br />
University of Maryland College Park Institutional Review Board Office <br /> 
1204 Marie Mount Hall  <br />
College Park, Maryland, 20742		 <br />
E-mail: irb@umd.edu Telephone: 301-405-0678 <br /> <br />
						
For more information regarding participant rights, please visit:  https://research.umd.edu/irb-research-participants 
<br /> <br />						
This research has been reviewed according to the University of Maryland, College Park IRB procedures for research involving human subjects. 	<br />		
<h3> VIII. Statement of Consent </h3>
By clicking “Sign Up”, you indicate that you are at least 18 years of age; you have read this consent form or have had it read to you; your questions have been answered to your satisfaction and you voluntarily agree to participate in this research study. 

            </div> <br /> <br />
            <div style={{fontSize: 20}}> By signing up, you hereby agree to the terms and services listed above </div> <br />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className="submit"
            >
              Sign Up
            </Button>
  <Grid container className="signup" style={{marginBottom: 50}}>
              <Grid item xs></Grid>
              <Grid item>
                <a href="/login" className="register">
                  {"Already have an account? Login "}
                </a>
              </Grid>
            </Grid>
          </form>
        </div>
      </Container>
    );
  }
}
